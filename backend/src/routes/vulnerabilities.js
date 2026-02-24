const express = require('express');
const router = express.Router();
const vulnerabilityController = require('../controllers/vulnerabilityController');

router.get('/', vulnerabilityController.getAll);
router.get('/:code', vulnerabilityController.getByCode);

module.exports = router;
