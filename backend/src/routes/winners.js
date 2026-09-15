const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ success: true, message: 'winners endpoint ready' }));
module.exports = router;
