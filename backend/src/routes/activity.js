const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const activityController = require('../controllers/activityController');

router.get('/feed', auth, activityController.getUserActivityFeed);

module.exports = router;
