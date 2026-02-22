const UserModel = require('../models/userModel');


const AdminService = {
  async getUsers() {
    return UserModel.findAll();
  },

  async updateUserRole({ currentUser, userId, role }) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user id');
    }

    if (role !== 'user' && role !== 'admin') {
      throw new Error('role must be user or admin');
    }

    if (currentUser?.id === userId) {
      throw new Error('You cannot change your own role');
    }

    const target = await UserModel.findById(userId);
    if (!target) {
      throw new Error('User not found');
    }

    const affected = await UserModel.updateRole(userId, role);
    if (affected === 0) {
      throw new Error('User not found');
    }

    return { message: 'Role updated', userId, role };
  },

  async getStats() {
    // 1. Количество курсов (таблица vulnerabilities)
    const [[{ cnt: courses_total }]] = await require('../config/db').query('SELECT COUNT(*) as cnt FROM vulnerabilities');

    // 2. Общее число упражнений
    const [[{ cnt: exercises_total }]] = await require('../config/db').query('SELECT COUNT(*) as cnt FROM exercises');

    // 3. Общее число завершённых упражнений всеми пользователями
    const [[{ cnt: completed_total }]] = await require('../config/db').query('SELECT COUNT(*) as cnt FROM user_exercises');

    // 4. Количество выполненных упражнений по каждому пользователю
    const [userExerciseCounts] = await require('../config/db').query(`
      SELECT u.id as user_id, u.username, COUNT(ue.exercise_id) as completed_count
      FROM users u
      LEFT JOIN user_exercises ue ON u.id = ue.user_id
      GROUP BY u.id
    `);

    return {
      courses_total,
      exercises_total,
      completed_total,
      userExerciseCounts
    };
  },

  async setUserBlocked({ currentUser, userId, isBlocked }) {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error('Invalid user id');

  if (currentUser?.id === userId) {
    throw new Error('You cannot block yourself');
  }

  const target = await UserModel.findById(userId);
  if (!target) throw new Error('User not found');

  const affected = await UserModel.setBlocked(userId, isBlocked);
  if (affected === 0) throw new Error('User not found');

  return { message: isBlocked ? 'User blocked' : 'User unblocked', userId, is_blocked: isBlocked ? 1 : 0 };
    },
};

module.exports = AdminService;
