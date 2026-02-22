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
    const users_total = await UserModel.countAll();
    const admins_total = await UserModel.countAdmins();
    return { users_total, admins_total };
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
