const Draw = require('../models/Draw');
const User = require('../models/User');
const Score = require('../models/Score');
const Winner = require('../models/Winner');
const Participation = require('../models/Participation');

const MONTHLY_PRICE = 999;
const YEARLY_MONTHLY_EQ = Math.round(9999 / 12);
const PRIZE_POOL_RATE = 0.30;

/**
 * Calculate prize pool from active subscribers
 */
async function calculatePrizePool(rollover = 0) {
  const activeUsers = await User.find({
    'subscription.status': 'active'
  }).select('subscription');

  const count = activeUsers.length;
  let monthlyContribution = 0;

  activeUsers.forEach((u) => {
    const price =
      u.subscription?.plan === 'yearly'
        ? YEARLY_MONTHLY_EQ
        : MONTHLY_PRICE;

    monthlyContribution += price * PRIZE_POOL_RATE;
  });

  const basePool = Math.round(monthlyContribution);
  const total = basePool + (rollover || 0);

  return {
    total,
    basePool,
    jackpot: Math.round(total * 0.40),
    fourMatch: Math.round(total * 0.35),
    threeMatch: Math.round(total * 0.25),
    contributionPerSubscriber:
      count > 0 ? Math.round(basePool / count) : 0,
    activeSubscribersAtDraw: count
  };
}

/**
 * Generate random 5 unique numbers from 1-45
 */
function generateRandomNumbers() {
  const nums = new Set();

  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(nums).sort((a, b) => a - b);
}

/**
 * Generate algorithmic numbers based on score frequency
 */
async function generateAlgorithmicNumbers() {
  const scores = await Score.find().select('value');

  const freq = {};

  for (let i = 1; i <= 45; i++) {
    freq[i] = 1;
  }

  scores.forEach((s) => {
    if (s.value >= 1 && s.value <= 45) {
      freq[s.value] = (freq[s.value] || 1) + 2;
    }
  });

  const pool = [];

  Object.entries(freq).forEach(([num, weight]) => {
    for (let i = 0; i < weight; i++) {
      pool.push(Number(num));
    }
  });

  const selected = new Set();

  while (selected.size < 5 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.add(pool[idx]);
  }

  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Get user's latest 5 score numbers
 */
async function getUserNumbers(userId) {
  const scores = await Score.find({
    user: userId
  })
    .sort({ date: -1 })
    .limit(5);

  return scores.map((s) =>
    Math.min(45, Math.max(1, s.value))
  );
}

/**
 * Count matches between user numbers and winning numbers
 */
function countMatches(userNumbers, winningNumbers) {
  const winSet = new Set(winningNumbers);

  return userNumbers.filter((n) => winSet.has(n)).length;
}

/**
 * Find potential winners
 */
async function findPotentialWinners(winningNumbers) {
  const activeUsers = await User.find({
    'subscription.status': 'active',
    role: 'user'
  });

  const five = [];
  const four = [];
  const three = [];

  for (const user of activeUsers) {
    const nums = await getUserNumbers(user._id);

    if (nums.length < 3) continue;

    const matchCount = countMatches(
      nums,
      winningNumbers
    );

    const matched = nums.filter((n) =>
      winningNumbers.includes(n)
    );

    const winnerData = {
      user: user._id,
      name: user.name,
      email: user.email,
      matchedNumbers: matched,
      matchCount
    };

    if (matchCount === 5) {
      five.push(winnerData);
    } else if (matchCount === 4) {
      four.push(winnerData);
    } else if (matchCount === 3) {
      three.push(winnerData);
    }
  }

  return {
    fiveMatch: five,
    fourMatch: four,
    threeMatch: three
  };
}

/**
 * Get previous unclaimed jackpot rollover
 */
async function getJackpotRollover() {
  const lastPublished = await Draw.findOne({
    status: 'published'
  }).sort({
    year: -1,
    month: -1
  });

  if (!lastPublished) {
    return 0;
  }

  const fiveWinners =
    lastPublished.winners?.fiveMatch || [];

  if (fiveWinners.length === 0) {
    return lastPublished.prizePool?.jackpot || 0;
  }

  return 0;
}

/**
 * Create a draft draw
 */
exports.createDraw = async (
  month,
  year,
  method = 'random',
  adminId
) => {
  const existing = await Draw.findOne({
    month,
    year
  });

  if (existing) {
    throw new Error(
      `Draw for ${month}/${year} already exists`
    );
  }

  const rollover = await getJackpotRollover();
  const pool = await calculatePrizePool(rollover);

  const draw = await Draw.create({
    month,
    year,
    status: 'draft',
    method,

    prizePool: {
      total: pool.total,
      jackpot: pool.jackpot,
      fourMatch: pool.fourMatch,
      threeMatch: pool.threeMatch,
      contributionPerSubscriber:
        pool.contributionPerSubscriber
    },

    activeSubscribersAtDraw:
      pool.activeSubscribersAtDraw,

    jackpotRolloverFromPrevious: rollover,
    createdBy: adminId
  });

  return draw;
};

/**
 * Simulate draw
 */
exports.simulateDraw = async (
  drawId,
  method
) => {
  const draw = await Draw.findById(drawId);

  if (!draw) {
    throw new Error('Draw not found');
  }

  if (draw.status === 'published') {
    throw new Error(
      'Cannot simulate a published draw'
    );
  }

  const useMethod =
    method || draw.method || 'random';

  const winningNumbers =
    useMethod === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers();

  const rollover =
    draw.jackpotRolloverFromPrevious || 0;

  const pool =
    await calculatePrizePool(rollover);

  const potential =
    await findPotentialWinners(
      winningNumbers
    );

  const split = (amount, count) =>
    count > 0
      ? Math.round(amount / count)
      : 0;

  const simulationData = {
    method: useMethod,
    winningNumbers,
    timestamp: new Date(),

    prizePool: pool,

    potentialWinners: {
      fiveMatch: {
        count: potential.fiveMatch.length,
        prizeEach: split(
          pool.jackpot,
          potential.fiveMatch.length
        ),
        users: potential.fiveMatch
      },

      fourMatch: {
        count: potential.fourMatch.length,
        prizeEach: split(
          pool.fourMatch,
          potential.fourMatch.length
        ),
        users: potential.fourMatch
      },

      threeMatch: {
        count: potential.threeMatch.length,
        prizeEach: split(
          pool.threeMatch,
          potential.threeMatch.length
        ),
        users: potential.threeMatch
      }
    },

    rolloverIfNoFiveMatch:
      potential.fiveMatch.length === 0
        ? pool.jackpot
        : 0
  };

  draw.method = useMethod;
  draw.winningNumbers = winningNumbers;
  draw.status = 'simulated';
  draw.simulatedAt = new Date();
  draw.simulationData = simulationData;

  draw.prizePool = {
    total: pool.total,
    jackpot: pool.jackpot,
    fourMatch: pool.fourMatch,
    threeMatch: pool.threeMatch,
    contributionPerSubscriber:
      pool.contributionPerSubscriber
  };

  draw.activeSubscribersAtDraw =
    pool.activeSubscribersAtDraw;

  await draw.save();

  return {
    draw,
    simulation: simulationData
  };
};

/**
 * Publish draw and create Winner records
 */
exports.publishDraw = async (
  drawId,
  adminId
) => {
  const draw = await Draw.findById(drawId);

  if (!draw) {
    throw new Error('Draw not found');
  }

  if (draw.status !== 'simulated') {
    throw new Error(
      'Draw must be simulated before publishing'
    );
  }

  if (
    !draw.winningNumbers ||
    draw.winningNumbers.length !== 5
  ) {
    throw new Error(
      'No winning numbers from simulation'
    );
  }

  const potential =
    await findPotentialWinners(
      draw.winningNumbers
    );

  const pool = draw.prizePool;

  const split = (amount, count) =>
    count > 0
      ? Math.round(amount / count)
      : 0;

  const fivePrize = split(
    pool.jackpot,
    potential.fiveMatch.length
  );

  const fourPrize = split(
    pool.fourMatch,
    potential.fourMatch.length
  );

  const threePrize = split(
    pool.threeMatch,
    potential.threeMatch.length
  );

  await Winner.deleteMany({
    draw: draw._id
  });

  const createWinners = async (
    list,
    matchType,
    prize
  ) => {
    const created = [];

    for (const w of list) {
      const winner = await Winner.create({
        user: w.user,
        draw: draw._id,
        matchType,
        matchedNumbers: w.matchedNumbers,
        prizeAmount: prize,

        verification: {
          status: 'pending_proof'
        },

        payout: {
          status: 'pending'
        }
      });

      created.push({
        user: w.user,
        matchedNumbers: w.matchedNumbers,
        prizeAmount: prize
      });
    }

    return created;
  };

  const fiveCreated = await createWinners(
    potential.fiveMatch,
    'five',
    fivePrize
  );

  const fourCreated = await createWinners(
    potential.fourMatch,
    'four',
    fourPrize
  );

  const threeCreated = await createWinners(
    potential.threeMatch,
    'three',
    threePrize
  );

  draw.winners = {
    fiveMatch: fiveCreated,
    fourMatch: fourCreated,
    threeMatch: threeCreated
  };

  draw.status = 'published';
  draw.publishedAt = new Date();

  await draw.save();

  return draw;
};

/**
 * List all draws
 */
exports.listDraws = async () => {
  return await Draw.find()
    .sort({
      year: -1,
      month: -1
    })
    .populate(
      'createdBy',
      'name email'
    );
};

/**
 * Get single draw
 */
exports.getDraw = async (id) => {
  return await Draw.findById(id)
    .populate(
      'createdBy',
      'name email'
    );
};

exports.calculatePrizePool =
  calculatePrizePool;

exports.getJackpotRollover =
  getJackpotRollover;