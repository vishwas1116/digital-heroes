const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 45
  },
  date: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Ensure one score per user per date
scoreSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
