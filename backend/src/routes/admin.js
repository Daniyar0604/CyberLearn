const express = require('express');
const router = express.Router();

const { auth, requireAdmin } = require('../middleware/auth');
const AdminController = require('../controllers/adminController');

router.use(auth, requireAdmin);

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.get('/stats', AdminController.getStats);
router.patch('/users/:id/block', AdminController.setUserBlocked);
router.get('/content-freeze', AdminController.getContentFreezeOverview);
router.patch('/courses/:id/freeze', AdminController.setCourseFrozen);
router.patch('/exercises/:id/freeze', AdminController.setExerciseFrozen);

module.exports = router;
