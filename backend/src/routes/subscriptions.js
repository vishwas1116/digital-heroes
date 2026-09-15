const express = require('express');

const router = express.Router();

const {
  getStatus,
  createCheckout,
  activateDemo,
  cancel,
  webhook
} = require('../controllers/subscriptionController');

const { protect } = require('../middleware/auth');

router.post('/webhook', webhook);

router.get('/status', protect, getStatus);

router.post('/checkout', protect, createCheckout);

router.post('/activate-demo', protect, activateDemo);

router.post('/cancel', protect, cancel);

module.exports = router;