const drawService = require('../services/drawService');
const Draw = require('../models/Draw');

exports.listDraws = async (req, res) => {
  try {
    const draws = await drawService.listDraws();

    res.json({
      success: true,
      draws
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDraw = async (req, res) => {
  try {
    const draw = await drawService.getDraw(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: 'Draw not found'
      });
    }

    res.json({
      success: true,
      draw
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createDraw = async (req, res) => {
  try {
    const { month, year, method } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be 1-12'
      });
    }

    const draw = await drawService.createDraw(
      Number(month),
      Number(year),
      method || 'random',
      req.user._id
    );

    res.status(201).json({
      success: true,
      draw,
      message: 'Draft draw created'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.simulateDraw = async (req, res) => {
  try {
    const { method } = req.body;

    const result = await drawService.simulateDraw(
      req.params.id,
      method
    );

    res.json({
      success: true,
      message: 'Simulation complete — review before publishing',
      draw: result.draw,
      simulation: result.simulation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.publishDraw = async (req, res) => {
  try {
    const draw = await drawService.publishDraw(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Draw published. Winners created.',
      draw
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPrizePoolPreview = async (req, res) => {
  try {
    const rollover =
      await drawService.getJackpotRollover();

    const pool =
      await drawService.calculatePrizePool(rollover);

    res.json({
      success: true,
      pool,
      rollover
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};