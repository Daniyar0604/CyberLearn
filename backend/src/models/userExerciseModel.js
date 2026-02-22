const db = require('../config/db');

/**
 * Проверить, выполнено ли упражнение пользователем
 */
async function isCompleted(conn, userId, exerciseId) {
  const executor = conn || db;

  const [rows] = await executor.query(
    `
    SELECT 1
    FROM user_exercises
    WHERE user_id = ? AND exercise_id = ?
    LIMIT 1
    `,
    [userId, exerciseId]
  );

  return rows.length > 0;
}

/**
 * Засчитать выполнение упражнения
 */
async function create(conn, userId, exerciseId) {
  const executor = conn || db;

  await executor.query(
    `
    INSERT INTO user_exercises (user_id, exercise_id)
    VALUES (?, ?)
    `,
    [userId, exerciseId]
  );
}

/**
 * Посчитать количество выполненных упражнений пользователем
 */
async function countByUser(userId) {
  const [[row]] = await db.query(
    `
    SELECT COUNT(*) AS cnt
    FROM user_exercises
    WHERE user_id = ?
    `,
    [userId]
  );

  return Number(row?.cnt || 0);
}

module.exports = {
  isCompleted,
  create,
  countByUser
};
