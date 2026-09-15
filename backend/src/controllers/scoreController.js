const scoreService = require('../services/scoreService');

exports.getMyScores = async (req, res) => {
  try {
    const scores = await scoreService.getUserScores(req.user._id);

    res.json({
      success: true,
      scores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addScore = async (req, res) => {
  try {
    const { value, date, note } = req.body;

    if (!value || !date) {
      return res.status(400).json({
        success: false,
        message: 'Score value and date are required'
      });
    }

    const score = await scoreService.addOrUpdateScore(
      req.user._id,
      Number(value),
      date,
      note
    );

    res.status(201).json({
      success: true,
      score,
      message: 'Score saved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const score = await scoreService.updateScore(
      req.user._id,
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      score
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteScore = async (req, res) => {
  try {
    await scoreService.deleteScore(
      req.user._id,
      req.params.id
    );

    res.json({
      success: true,
      message: 'Score deleted'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};