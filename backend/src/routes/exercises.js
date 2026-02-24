const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { auth } = require('../middleware/auth');

router.get('/status', auth, exerciseController.getAllStatus);
router.get('/:code/:order', auth, exerciseController.getByOrder);
router.get('/:code', exerciseController.getAllByCode);

module.exports = router;
