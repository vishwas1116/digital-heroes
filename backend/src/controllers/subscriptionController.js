const User = require('../models/User');
const stripeService = require('../services/stripeService');

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      subscription: user.subscription,
      stripeConfigured: stripeService.isStripeConfigured(),
      plans: {
        monthly: {
          price: 999,
          currency: 'INR',
          label: 'Monthly'
        },
        yearly: {
          price: 9999,
          currency: 'INR',
          label: 'Yearly',
          savings: '≈17% off'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createCheckout = async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Plan must be monthly or yearly'
      });
    }

    const user = await User.findById(req.user._id);
    const clientUrl =
      process.env.CLIENT_URL || 'http://localhost:5173';

    const result =
      await stripeService.createCheckoutSession({
        user,
        plan,
        successUrl:
          `${clientUrl}/dashboard?subscription=success&plan=${plan}`,
        cancelUrl:
          `${clientUrl}/dashboard?subscription=cancelled`
      });

    if (result.mode === 'demo') {
      return res.json({
        success: true,
        mode: 'demo',
        message:
          'Stripe keys not set. Use demo activation endpoint.',
        demoActivate: true
      });
    }

    res.json({
      success: true,
      mode: 'stripe',
      url: result.url,
      sessionId: result.sessionId
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/** Demo/test activation without real Stripe payment */
exports.activateDemo = async (req, res) => {
  try {
    const { plan = 'monthly' } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan'
      });
    }

    let user = await User.findById(req.user._id);

    user =
      await stripeService.activateDemoSubscription(
        user,
        plan
      );

    res.json({
      success: true,
      message:
        `${plan} subscription activated (test mode)`,
      subscription: user.subscription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancel = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    if (
      user.subscription?.status !== 'active' &&
      user.subscription?.status !== 'cancelled'
    ) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel'
      });
    }

    user =
      await stripeService.cancelSubscription(user);

    res.json({
      success: true,
      message:
        'Subscription cancelled. Access continues until period end.',
      subscription: user.subscription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.webhook = async (req, res) => {
  // For production: verify stripe signature with raw body
  try {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
      await stripeService.handleCheckoutCompleted(
        event.data.object
      );
    }

    if (
      event.type ===
      'customer.subscription.deleted'
    ) {
      const User = require('../models/User');

      const subId = event.data.object.id;

      const user = await User.findOne({
        'subscription.stripeSubscriptionId': subId
      });

      if (user) {
        user.subscription.status = 'lapsed';
        await user.save();
      }
    }

    res.json({
      received: true
    });
  } catch (error) {
    console.error('Webhook error:', error);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};