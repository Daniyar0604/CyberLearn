const db = require('../config/db');

/**
 * Получить ленту активности пользователя: завершение модулей и курсов
 */
async function getUserActivityFeed(userId) {
  // Завершенные упражнения (модули)
  const [completedModules] = await db.query(`
    SELECT ue.exercise_id, e.title, v.title AS course_title, ue.completed_at
    FROM user_exercises ue
    JOIN exercises e ON ue.exercise_id = e.id
    JOIN vulnerabilities v ON e.vulnerability_id = v.id
    WHERE ue.user_id = ?
    ORDER BY ue.completed_at DESC
    LIMIT 20
  `, [userId]);

  // Завершенные курсы (все упражнения выполнены)
  const [completedCourses] = await db.query(`
    SELECT v.id AS course_id, v.title AS course_title, MAX(ue.completed_at) AS completed_at
    FROM vulnerabilities v
    JOIN exercises e ON e.vulnerability_id = v.id
    JOIN user_exercises ue ON ue.exercise_id = e.id AND ue.user_id = ?
    GROUP BY v.id
    HAVING COUNT(e.id) = (
      SELECT COUNT(*) FROM exercises WHERE vulnerability_id = v.id
    )
    ORDER BY completed_at DESC
    LIMIT 10
  `, [userId]);

  // Attach type for sorting
  const modules = completedModules.map(m => ({ ...m, type: 'module' }));
  const courses = completedCourses.map(c => ({ ...c, type: 'course' }));
  // Merge and sort: by completed_at desc, module before course if same time
  const all = [...modules, ...courses].sort((a, b) => {
    const ta = new Date(a.completed_at).getTime();
    const tb = new Date(b.completed_at).getTime();
    if (tb !== ta) return tb - ta;
    // If same time, module after course
    if (a.type === 'module' && b.type === 'course') return 1;
    if (a.type === 'course' && b.type === 'module') return -1;
    return 0;
  });
  return { feed: all };
}

module.exports = { getUserActivityFeed };
