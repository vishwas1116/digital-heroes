const express = require('express');

const router = express.Router();

const {
  getAnalytics,
  getUsers,
  updateUser
} = require('../controllers/adminController');

const {
  protect,
  authorize
} = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;