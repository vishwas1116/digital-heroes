const express = require('express');

const router = express.Router();

const {
  listWinners,
  getMyWinnings,
  uploadProof,
  verifyWinner,
  markPayout
} = require('../controllers/winnerController');

const {
  protect,
  authorize
} = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/me', protect, getMyWinnings);

router.post(
  '/:id/proof',
  protect,
  upload.single('proof'),
  uploadProof
);

router.get(
  '/',
  protect,
  authorize('admin'),
  listWinners
);

router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  verifyWinner
);

router.put(
  '/:id/payout',
  protect,
  authorize('admin'),
  markPayout
);

module.exports = router;