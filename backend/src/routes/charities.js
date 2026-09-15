const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ success: true, message: 'charities endpoint ready' }));
module.exports = router;
