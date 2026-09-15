const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  draw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    required: true
  },
  matchType: {
    type: String,
    enum: ['five', 'four', 'three'],
    required: true
  },
  matchedNumbers: [Number],
  prizeAmount: {
    type: Number,
    required: true
  },
  verification: {
    status: {
      type: String,
      enum: ['pending_proof', 'proof_submitted', 'approved', 'rejected'],
      default: 'pending_proof'
    },
    proofImage: String,
    proofSubmittedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectionReason: String
  },
  payout: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paidAt: Date,
    transactionId: String,
    notes: String
  }
}, {
  timestamps: true
});

winnerSchema.index({ user: 1, draw: 1 }, { unique: true });

module.exports = mongoose.model('Winner', winnerSchema);
