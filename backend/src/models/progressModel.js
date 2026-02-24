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
      AND v.is_frozen = 0
      AND e.is_frozen = 0
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

module.exports = {
  getProgressByVulnerability
};
