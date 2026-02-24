// JWT secret для подписи токенов
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiresIn: '7d'
};
