const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');
const UserModel = require('../models/userModel');

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await UserModel.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  return next();
}

module.exports = { auth, requireAdmin };
