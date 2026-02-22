const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const controller = require('../controllers/exerciseProgressController');

router.post(
  '/exercises/:exerciseId/complete',
  auth,
  controller.completeExercise
);

module.exports = router;
