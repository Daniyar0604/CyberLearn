const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

router.get('/vulnerability/:code', auth, progressController.getVulnerabilityProgress);

module.exports = router;
