const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt');

const SALT_ROUNDS = 10;

const AuthService = {
  // обновить bio пользователя
  async updateBio({ userId, bio }) {
    return UserModel.updateBio(userId, bio);
  },

  // регистрация
  async register({ username, email, password }) {
    // Проверка: существует ли email
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Создаём пользователя
    const userId = await UserModel.create({
      username,
      email,
      password: hashedPassword
    });

    // Получаем пользователя
    const user = await UserModel.findById(userId);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio,
      level: user.level,
      study_hours: user.study_hours,
      avatar: user.avatar,
      created_at: user.created_at
    };
  },

  // логин
  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (user.is_blocked === 1) {
      throw new Error('User is blocked');
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        level: user.level,
        study_hours: user.study_hours,
        avatar: user.avatar,
        created_at: user.created_at
      }
    };
  }
};

module.exports = AuthService;
