const express = require('express');
const Charity = require('../models/Charity');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const charities = await Charity.find({ isActive: true });

    res.json({
      success: true,
      charities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
