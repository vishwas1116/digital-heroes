const User = require('../models/User');
const Score = require('../models/Score');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeSubscribers = await User.countDocuments({
      'subscription.status': 'active'
    });
    const totalCharities = await Charity.countDocuments({ isActive: true });
    const totalScores = await Score.countDocuments();
    const totalWinners = await Winner.countDocuments();

    const pendingPayouts = await Winner.countDocuments({
      'payout.status': 'pending',
      'verification.status': 'approved'
    });

    const activeUsers = await User.find({
      'subscription.status': 'active'
    }).select('subscription charityContributionPercent');

    const MONTHLY_PRICE = 999;
    const YEARLY_PRICE = 9999;
    const PRIZE_POOL_RATE = 0.30;

    let charityTotals = 0;
    let prizePoolEstimate = 0;

    activeUsers.forEach((u) => {
      const price =
        u.subscription?.plan === 'yearly'
          ? YEARLY_PRICE / 12
          : MONTHLY_PRICE;

      charityTotals +=
        price * ((u.charityContributionPercent || 10) / 100);

      prizePoolEstimate += price * PRIZE_POOL_RATE;
    });

    const draws = await Draw.find()
      .sort({ year: -1, month: -1 })
      .limit(12);

    const drawStats = draws.map((d) => ({
      month: d.month,
      year: d.year,
      status: d.status,
      prizePool: d.prizePool?.total || 0,
      winnersCount:
        (d.winners?.fiveMatch?.length || 0) +
        (d.winners?.fourMatch?.length || 0) +
        (d.winners?.threeMatch?.length || 0)
    }));

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeSubscribers,
        totalCharities,
        totalScores,
        totalWinners,
        pendingPayouts,
        charityContributionTotals: Math.round(charityTotals),
        estimatedPrizePool: Math.round(prizePoolEstimate),
        drawStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          email: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }

    if (status) {
      query['subscription.status'] = status;
    }

    const users = await User.find(query)
      .populate('charity', 'name')
      .sort({ createdAt: -1 })
      .select('-password');

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowed = [
      'name',
      'isActive',
      'charityContributionPercent',
      'subscription',
      'role',
      'charity'
    ];

    const updates = {};

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    )
      .select('-password')
      .populate('charity', 'name');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};