const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { auth } = require('../middleware/auth');

// Получить одно задание + статус выполнения
router.get('/:code/:order', auth, exerciseController.getByOrder);

// Получить список заданий
router.get('/:code', exerciseController.getAllByCode);

// ❌ Засчёт задания УБРАН (теперь через xpRoutes)

module.exports = router;
