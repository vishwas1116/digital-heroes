const Charity = require('../models/Charity');

// Get all active charities
exports.getCharities = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const charities = await Charity.find(query)
      .sort({ isFeatured: -1, name: 1 });

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
};

// Get single charity
exports.getCharity = async (req, res) => {
  try {
    const charity = await Charity.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
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
};

// Admin: create charity
exports.createCharity = async (req, res) => {
  try {
    const charity = await Charity.create(req.body);

    res.status(201).json({
      success: true,
      charity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: update charity
exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: delete/deactivate charity
exports.deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    res.json({
      success: true,
      message: 'Charity deactivated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};