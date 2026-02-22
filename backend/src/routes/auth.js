const express = require('express');
const AuthController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.patch('/bio', auth, AuthController.updateBio);

// GET /api/auth/me (удобно для фронта)
router.get('/me', auth, AuthController.me);

// POST /api/auth/register
router.post('/register', AuthController.register);

// POST /api/auth/login
router.post('/login', AuthController.login);

module.exports = router;
