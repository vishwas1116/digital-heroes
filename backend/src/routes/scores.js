const express = require('express');

const router = express.Router();

const {
  getMyScores,
  addScore,
  updateScore,
  deleteScore
} = require('../controllers/scoreController');

const {
  protect,
  requireActiveSubscription
} = require('../middleware/auth');

// All score routes require login
router.use(protect);

router.get('/', getMyScores);
router.post('/', addScore);
router.put('/:id', updateScore);
router.delete('/:id', deleteScore);

module.exports = router;