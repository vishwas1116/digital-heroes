const express = require('express');
const router = express.Router();
const {
  getStatus,
  createOrder,
  verifyPayment,
  activateDemo,
  cancel
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.get('/status', protect, getStatus);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/activate-demo', protect, activateDemo);
router.post('/cancel', protect, cancel);

module.exports = router;