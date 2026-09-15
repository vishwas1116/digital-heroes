const Donation = require('../models/Donation');
const Charity = require('../models/Charity');
const User = require('../models/User');

exports.createDonation = async (req, res) => {
  try {
    const { charityId, amount, message } = req.body;
    const amt = Number(amount);

    if (!charityId) {
      return res.status(400).json({
        success: false,
        message: 'Charity is required'
      });
    }

    if (!amt || amt < 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₹1'
      });
    }

    if (amt > 500000) {
      return res.status(400).json({
        success: false,
        message: 'Amount exceeds maximum allowed'
      });
    }

    const charity = await Charity.findById(charityId);

    if (!charity || !charity.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive charity'
      });
    }

    // Demo / test mode: mark completed immediately
    // No real payment gateway is used here.
    const donation = await Donation.create({
      user: req.user._id,
      charity: charityId,
      amount: amt,
      type: 'independent',
      status: 'completed',
      stripePaymentId: `demo_don_${Date.now()}`
    });

    charity.totalReceived = (charity.totalReceived || 0) + amt;
    await charity.save();

    const populated = await Donation.findById(donation._id)
      .populate('charity', 'name slug')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: `Thank you! ₹${amt.toLocaleString()} directed to ${charity.name}.`,
      donation: populated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      user: req.user._id
    })
      .populate('charity', 'name slug image')
      .sort({ createdAt: -1 });

    const total = donations
      .filter((d) => d.status === 'completed')
      .reduce((s, d) => s + d.amount, 0);

    res.json({
      success: true,
      donations,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.listDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('user', 'name email')
      .populate('charity', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};