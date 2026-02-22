const AdminService = require('../services/adminService');

const AdminController = {
  async getUsers(req, res) {
    try {
      const users = await AdminService.getUsers();
      return res.json({ users });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async updateUserRole(req, res) {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      const result = await AdminService.updateUserRole({
        currentUser: req.user,
        userId,
        role,
      });

      return res.json(result);
    } catch (e) {
      const msg = e?.message || 'Bad Request';

      if (msg === 'Invalid user id' || msg === 'role must be user or admin') {
        return res.status(400).json({ message: msg });
      }

      if (msg === 'User not found') {
        return res.status(404).json({ message: msg });
      }

      if (msg === 'You cannot change your own role') {
        return res.status(400).json({ message: msg });
      }

      return res.status(500).json({ message: msg });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await AdminService.getStats();
      return res.json(stats);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

async setUserBlocked(req, res) {
  try {
    const userId = Number(req.params.id);
    const { is_blocked } = req.body;

    const result = await AdminService.setUserBlocked({
      currentUser: req.user,
      userId,
      isBlocked: Boolean(is_blocked),
    });

    return res.json(result);
  } catch (e) {
    const msg = e?.message || 'Bad Request';

    if (msg === 'User not found') return res.status(404).json({ message: msg });
    if (msg === 'Invalid user id') return res.status(400).json({ message: msg });
    if (msg === 'You cannot block yourself') return res.status(400).json({ message: msg });

    return res.status(500).json({ message: msg });
  }
},

};

module.exports = AdminController;
