const aiService = require('../services/aiService')

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body

    const result = await aiService.chat(
      message,
      history || []
    )

    res.json({
      success: true,
      ...result
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      reply: 'Something went wrong. Please try again.'
    })
  }
}