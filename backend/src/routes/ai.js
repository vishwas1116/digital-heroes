const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')

const { chat } = require('../controllers/aiController')

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many questions. Wait a moment.'
  }
})

router.post(
  '/chat',
  aiLimiter,
  chat
)

module.exports = router