const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Charity = require('../models/Charity');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, charityId, charityContributionPercent = 10, plan = 'monthly' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (charityContributionPercent < 10) {
      return res.status(400).json({ success: false, message: 'Charity contribution must be at least 10%' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (charityId) {
      const charity = await Charity.findById(charityId);
      if (!charity || !charity.isActive) {
        return res.status(400).json({ success: false, message: 'Invalid or inactive charity' });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      charity: charityId || null,
      charityContributionPercent: Math.min(100, Math.max(10, charityContributionPercent)),
      subscription: {
        plan: ['monthly', 'yearly'].includes(plan) ? plan : 'none',
        status: 'none'
      }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        charity: user.charity,
        charityContributionPercent: user.charityContributionPercent,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        charity: user.charity,
        charityContributionPercent: user.charityContributionPercent,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('charity', 'name slug image');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
