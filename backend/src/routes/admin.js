const express = require('express');
const router = express.Router();

const { auth, requireAdmin } = require('../middleware/auth');
const AdminController = require('../controllers/adminController');

router.use(auth, requireAdmin);

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.get('/stats', AdminController.getStats);
router.patch('/users/:id/block', AdminController.setUserBlocked);


module.exports = router;