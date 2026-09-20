const crypto = require('crypto');

const PLANS = {
  monthly: { amount: 99900, label: 'Digital Heroes Monthly' },
  yearly: { amount: 999900, label: 'Digital Heroes Yearly' }
};

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes('your_') || keySecret.includes('your_')) {
    return null;
  }
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

exports.isConfigured = () => !!getRazorpay();

exports.createOrder = async ({ user, plan }) => {
  const instance = getRazorpay();
  if (!instance) return { mode: 'demo' };
  if (!PLANS[plan]) throw new Error('Invalid plan');

  const order = await instance.orders.create({
    amount: PLANS[plan].amount,
    currency: 'INR',
    receipt: `dh_${plan}_${user._id.toString().slice(-6)}_${Date.now()}`,
    notes: {
      userId: user._id.toString(),
      plan,
      email: user.email
    }
  });

  return {
    mode: 'razorpay',
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    plan,
    planLabel: PLANS[plan].label
  };
};

exports.verifyPayment = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('Razorpay not configured');

  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (expected !== signature) {
    throw new Error('Invalid payment signature');
  }
  return true;
};

exports.activateSubscription = async (user, plan, paymentMeta = {}) => {
  const periodEnd = new Date();
  if (plan === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  user.subscription = {
    plan,
    status: 'active',
    currentPeriodEnd: periodEnd,
    cancelledAt: undefined,
    razorpayPaymentId: paymentMeta.paymentId,
    razorpayOrderId: paymentMeta.orderId
  };
  await user.save();
  return user;
};

exports.activateDemo = async (user, plan) => {
  return exports.activateSubscription(user, plan, {
    paymentId: `demo_pay_${Date.now()}`,
    orderId: `demo_order_${Date.now()}`
  });
};

exports.cancelSubscription = async (user) => {
  user.subscription.status = 'cancelled';
  user.subscription.cancelledAt = new Date();
  await user.save();
  return user;
};