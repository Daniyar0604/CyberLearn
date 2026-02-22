const db = require('../config/db');

const UserModel = {
  /* ======================
     BASIC USER METHODS
     ====================== */

  async create(user) {
    const {
      username,
      email,
      password,
      role = 'user',
      bio = 'Изучаю кибербезопасность и этичный хакинг',
      level = 'Beginner',
      study_hours = 0,
      avatar = 'default-avatar.png',
    } = user;

    const [result] = await db.query(
      `
      INSERT INTO users (
        username,
        email,
        password,
        role,
        bio,
        level,
        study_hours,
        avatar
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        username,
        email,
        password,
        role,
        bio,
        level,
        study_hours,
        avatar,
      ]
    );

    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const [rows] = await db.query(
      `
      SELECT
        id,
        username,
        email,
        role,
        bio,
        level,
        study_hours,
        avatar,
        created_at,
        is_blocked
      FROM users
      ORDER BY created_at DESC
      `
    );
    return rows;
  },

  async updateBio(userId, bio) {
    const [result] = await db.query(
      `UPDATE users SET bio = ? WHERE id = ?`,
      [bio, userId]
    );
    return result.affectedRows > 0;
  },

  async updateRole(id, role) {
    const [result] = await db.query(
      `UPDATE users SET role = ? WHERE id = ?`,
      [role, id]
    );
    return result.affectedRows > 0;
  },

  async setBlocked(id, isBlocked) {
    const [result] = await db.query(
      `UPDATE users SET is_blocked = ? WHERE id = ?`,
      [isBlocked ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  },

  async countAll() {
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS cnt FROM users`
    );
    return Number(row?.cnt || 0);
  },

  async countAdmins() {
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin'`
    );
    return Number(row?.cnt || 0);
  },

  /* ======================
     STUDY TIME
     ====================== */

  async incrementStudyTime(userId, minutes) {
    await db.query(
      `
      UPDATE users
      SET study_hours = study_hours + ?
      WHERE id = ?
      `,
      [minutes, userId]
    );
  },
};

module.exports = UserModel;
