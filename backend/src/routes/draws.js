const express = require('express');

const router = express.Router();

const {
  listDraws,
  getDraw,
  createDraw,
  simulateDraw,
  publishDraw,
  getPrizePoolPreview
} = require('../controllers/drawController');

const {
  protect,
  authorize
} = require('../middleware/auth');

// Public / authenticated can list published draws
router.get('/', listDraws);

router.get(
  '/pool/preview',
  protect,
  authorize('admin'),
  getPrizePoolPreview
);

router.get('/:id', getDraw);

// Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  createDraw
);

router.post(
  '/:id/simulate',
  protect,
  authorize('admin'),
  simulateDraw
);

router.post(
  '/:id/publish',
  protect,
  authorize('admin'),
  publishDraw
);

module.exports = router;