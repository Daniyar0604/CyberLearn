const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

// профиль текущего пользователя
router.get('/me', auth, userController.getMe);

// добавление времени обучения
router.post('/add-study-time', auth, userController.addStudyTime);

module.exports = router;
