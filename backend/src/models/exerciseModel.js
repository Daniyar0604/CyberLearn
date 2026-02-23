const db = require('../config/db');

// для страниц упражнений (как у тебя уже есть)
async function findByCodeAndOrder(code, order) {
  const [rows] = await db.query(`
    SELECT e.*
    FROM exercises e
    JOIN vulnerabilities v ON e.vulnerability_id = v.id
    WHERE v.code = ? AND e.order_index = ?
    LIMIT 1
  `, [code, order]);

  return rows[0];
}

async function findAllByCode(code) {
  const [rows] = await db.query(`
    SELECT e.*
    FROM exercises e
    JOIN vulnerabilities v ON e.vulnerability_id = v.id
    WHERE v.code = ?
    ORDER BY e.order_index
  `, [code]);

  return rows;
}

// ❗ используется XP-сервисом
async function findById(conn, exerciseId) {
  const [rows] = await conn.query(
    `SELECT id, difficulty
     FROM exercises
     WHERE id = ?
     LIMIT 1`,
    [exerciseId]
  );

  return rows[0];
}

async function findAllWithStatus(userId) {
  const [rows] = await db.query(
    `
    SELECT
      e.id,
      e.title,
      e.difficulty,
      e.order_index,
      v.title AS vulnerability_title,
      v.code AS vulnerability_code,
      CASE WHEN ue.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_completed
    FROM exercises e
    JOIN vulnerabilities v ON e.vulnerability_id = v.id
    LEFT JOIN user_exercises ue
      ON ue.exercise_id = e.id
      AND ue.user_id = ?
    ORDER BY v.id ASC, e.order_index ASC
    `,
    [userId]
  );
  return rows;
}

module.exports = {
  findByCodeAndOrder,
  findAllByCode,
  findById,
  findAllWithStatus
};
