const db = require('../config/db');

async function getProgressByVulnerability(userId, code) {
  const [rows] = await db.query(
    `
    SELECT
      COUNT(ue.exercise_id) AS completed,
      COUNT(e.id) AS total
    FROM exercises e
    LEFT JOIN user_exercises ue
      ON ue.exercise_id = e.id
      AND ue.user_id = ?
    JOIN vulnerabilities v
      ON v.id = e.vulnerability_id
    WHERE v.code = ?
    `,
    [userId, code]
  );

  const completed = rows[0].completed;
  const total = rows[0].total;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}

async function getAllProgress(userId) {
  const [rows] = await db.query(
    `
    SELECT
      v.id,
      v.code,
      v.title,
      v.description,
      COUNT(e.id) AS total,
      COUNT(ue.exercise_id) AS completed
    FROM vulnerabilities v
    LEFT JOIN exercises e ON v.id = e.vulnerability_id
    LEFT JOIN user_exercises ue ON e.id = ue.exercise_id AND ue.user_id = ?
    GROUP BY v.id, v.code, v.title, v.description
    ORDER BY v.id
    `,
    [userId]
  );

  return rows.map(row => ({
    code: row.code,
    title: row.title,
    description: row.description,
    total: row.total,
    completed: row.completed,
    percent: row.total === 0 ? 0 : Math.round((row.completed / row.total) * 100)
  }));
}

module.exports = {
  getProgressByVulnerability,
  getAllProgress
};
