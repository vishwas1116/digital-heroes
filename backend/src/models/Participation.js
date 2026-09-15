const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
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
  numbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 5 && v.every(n => n >= 1 && n <= 45);
      },
      message: 'Must have exactly 5 numbers between 1-45'
    }
  },
  scoresUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score'
  }],
  enteredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

participationSchema.index({ user: 1, draw: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);
