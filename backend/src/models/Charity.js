const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  description: String,
  location: String
}, { _id: true });

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  image: String,
  category: {
    type: String,
    enum: ['health', 'education', 'environment', 'community', 'sports', 'children', 'other'],
    default: 'community'
  },
  website: String,
  impactStatement: String,
  totalReceived: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  upcomingEvents: [eventSchema]
}, {
  timestamps: true
});

charitySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Charity', charitySchema);
