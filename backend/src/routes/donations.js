const express = require('express');

const router = express.Router();

const {
  createDonation,
  getMyDonations,
  listDonations
} = require('../controllers/donationController');

const {
  protect,
  authorize
} = require('../middleware/auth');

router.post('/', protect, createDonation);

router.get('/me', protect, getMyDonations);

router.get(
  '/',
  protect,
  authorize('admin'),
  listDonations
);

module.exports = router;