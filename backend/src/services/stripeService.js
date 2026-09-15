const Stripe = require('stripe');

const MONTHLY_PRICE = 99900;
const YEARLY_PRICE = 999900;

function getStripe() {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY.includes('your_stripe')
  ) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

exports.isStripeConfigured = () => !!getStripe();

exports.createCheckoutSession = async ({
  user,
  plan,
  successUrl,
  cancelUrl
}) => {
  const stripe = getStripe();

  if (!stripe) {
    return {
      mode: 'demo',
      message: 'Stripe not configured — use demo activation'
    };
  }

  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

  const sessionParams = {
    mode: 'subscription',
    customer_email: user.email,
    client_reference_id: user._id.toString(),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user._id.toString(),
      plan
    }
  };

  if (
    priceId &&
    !priceId.includes('price_monthly') &&
    !priceId.includes('price_yearly_test')
  ) {
    sessionParams.line_items = [
      {
        price: priceId,
        quantity: 1
      }
    ];
  } else {
    sessionParams.line_items = [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name:
              plan === 'yearly'
                ? 'Digital Heroes Yearly'
                : 'Digital Heroes Monthly',
            description: 'Golf performance + charity + monthly draws'
          },
          unit_amount:
            plan === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE,
          recurring: {
            interval: plan === 'yearly' ? 'year' : 'month'
          }
        },
        quantity: 1
      }
    ];
  }

  const session =
    await stripe.checkout.sessions.create(sessionParams);

  return {
    mode: 'stripe',
    sessionId: session.id,
    url: session.url
  };
};

exports.activateDemoSubscription = async (user, plan) => {
  const now = new Date();
  const periodEnd = new Date(now);

  if (plan === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  user.subscription = {
    plan,
    status: 'active',
    currentPeriodEnd: periodEnd,
    cancelledAt: undefined,
    stripeCustomerId:
      user.subscription?.stripeCustomerId ||
      `demo_cus_${user._id}`,
    stripeSubscriptionId:
      user.subscription?.stripeSubscriptionId ||
      `demo_sub_${Date.now()}`
  };

  await user.save();

  return user;
};

exports.cancelSubscription = async (user) => {
  const stripe = getStripe();

  if (
    stripe &&
    user.subscription?.stripeSubscriptionId &&
    !user.subscription.stripeSubscriptionId.startsWith('demo_')
  ) {
    try {
      await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );
    } catch (e) {
      console.warn('Stripe cancel warning:', e.message);
    }
  }

  user.subscription.status = 'cancelled';
  user.subscription.cancelledAt = new Date();

  await user.save();

  return user;
};

exports.handleCheckoutCompleted = async (session) => {
  const User = require('../models/User');

  const userId =
    session.metadata?.userId ||
    session.client_reference_id;

  if (!userId) return;

  const user = await User.findById(userId);

  if (!user) return;

  const plan = session.metadata?.plan || 'monthly';

  const periodEnd = new Date();

  if (plan === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  user.subscription = {
    plan,
    status: 'active',
    stripeCustomerId:
      session.customer ||
      user.subscription?.stripeCustomerId,
    stripeSubscriptionId:
      session.subscription ||
      user.subscription?.stripeSubscriptionId,
    currentPeriodEnd: periodEnd,
    cancelledAt: undefined
  };

  await user.save();
};