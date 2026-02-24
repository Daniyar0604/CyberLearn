const AuthService = require('../services/authService');

const AuthController = {
  async me(req, res) {
    return res.json({ user: req.user });
  },

  async updateBio(req, res) {
    try {
      const { bio } = req.body;
      if (typeof bio !== 'string') {
        return res.status(400).json({ message: 'bio must be a string' });
      }

      const updated = await AuthService.updateBio({ userId: req.user.id, bio });
      if (!updated) return res.status(404).json({ message: 'User not found' });

      return res.json({ message: 'Bio updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // POST /auth/register
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          message: 'All fields are required'
        });
      }

      const user = await AuthService.register({
        username,
        email,
        password
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  // POST /auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required'
        });
      }

      const { token, user } = await AuthService.login({
        email,
        password
      });

      return res.status(200).json({
        message: 'Login successful',
        token,
        user
      });
    } catch (error) {
      return res.status(401).json({
        message: error.message
      });
    }
  }
};

module.exports = AuthController;
