const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity'
  },

  charityContributionPercent: {
    type: Number,
    default: 10,
    min: 10,
    max: 100
  },

  subscription: {
    plan: {
      type: String,
      enum: ['none', 'monthly', 'yearly'],
      default: 'none'
    },

    status: {
      type: String,
      enum: ['none', 'active', 'cancelled', 'lapsed', 'past_due'],
      default: 'none'
    },

    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelledAt: Date
  },

  avatar: String,
  lastLogin: Date

}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (
    typeof this.password === 'string' &&
    this.password.startsWith('$2')
  ) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);