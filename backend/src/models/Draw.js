const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: {
    type: Number, // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'simulated', 'published', 'completed'],
    default: 'draft'
  },
  method: {
    type: String,
    enum: ['random', 'algorithmic'],
    default: 'random'
  },
  winningNumbers: {
    type: [Number],
    default: []
  },
  prizePool: {
    total: { type: Number, default: 0 },
    jackpot: { type: Number, default: 0 }, // 40% 5-match
    fourMatch: { type: Number, default: 0 }, // 35%
    threeMatch: { type: Number, default: 0 }, // 25%
    contributionPerSubscriber: { type: Number, default: 0 }
  },
  activeSubscribersAtDraw: {
    type: Number,
    default: 0
  },
  jackpotRolloverFromPrevious: {
    type: Number,
    default: 0
  },
  winners: {
    fiveMatch: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      matchedNumbers: [Number],
      prizeAmount: Number
    }],
    fourMatch: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      matchedNumbers: [Number],
      prizeAmount: Number
    }],
    threeMatch: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      matchedNumbers: [Number],
      prizeAmount: Number
    }]
  },
  simulationData: {
    type: mongoose.Schema.Types.Mixed
  },
  publishedAt: Date,
  simulatedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

drawSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
