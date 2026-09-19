const express = require('express');
const Charity = require('../models/Charity');

const router = express.Router();

// Get all charities
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

// Get charity by slug
router.get('/:slug', async (req, res) => {
  try {
    const charity = await Charity.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    res.json({
      success: true,
      charity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
