const User = require('../models/User');
const razorpayService = require('../services/razorpayService');

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      subscription: user.subscription,
      razorpayConfigured: razorpayService.isConfigured(),
      plans: {
        monthly: { price: 999, currency: 'INR' },
        yearly: { price: 9999, currency: 'INR' }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Plan must be monthly or yearly' });
    }

    const user = await User.findById(req.user._id);
    const result = await razorpayService.createOrder({ user, plan });

    if (result.mode === 'demo') {
      return res.json({
        success: true,
        mode: 'demo',
        demoActivate: true,
        message: 'Razorpay keys not set. Use demo activation.'
      });
    }

    res.json({
      success: true,
      mode: 'razorpay',
      orderId: result.orderId,
      amount: result.amount,
      currency: result.currency,
      keyId: result.keyId,
      plan: result.plan,
      planLabel: result.planLabel,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment details missing' });
    }
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    razorpayService.verifyPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    let user = await User.findById(req.user._id);
    user = await razorpayService.activateSubscription(user, plan, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    res.json({
      success: true,
      message: 'Payment verified. Subscription active.',
      subscription: user.subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.activateDemo = async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    let user = await User.findById(req.user._id);
    user = await razorpayService.activateDemo(user, plan);
    res.json({
      success: true,
      mode: 'demo',
      message: `${plan} activated in demo mode`,
      subscription: user.subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user.subscription || user.subscription.status === 'none') {
      return res.status(400).json({ success: false, message: 'No subscription to cancel' });
    }
    user = await razorpayService.cancelSubscription(user);
    res.json({
      success: true,
      message: 'Subscription cancelled.',
      subscription: user.subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};