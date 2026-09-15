const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['subscription_share', 'independent'],
    default: 'independent'
  },
  subscriptionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  stripePaymentId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
