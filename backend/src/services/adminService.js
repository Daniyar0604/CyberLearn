const UserModel = require('../models/userModel');
const db = require('../config/db');

function normalizeTinyInt(value) {
  return value ? 1 : 0;
}

const AdminService = {
  async getUsers() {
    return UserModel.findAll();
  },

  async updateUserRole({ currentUser, userId, role }) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user id');
    }

    if (role !== 'user' && role !== 'admin') {
      throw new Error('role must be user or admin');
    }

    if (currentUser?.id === userId) {
      throw new Error('You cannot change your own role');
    }

    const target = await UserModel.findById(userId);
    if (!target) {
      throw new Error('User not found');
    }

    const affected = await UserModel.updateRole(userId, role);
    if (affected === 0) {
      throw new Error('User not found');
    }

    return { message: 'Role updated', userId, role };
  },

  async getStats() {
    const [[{ cnt: courses_total }]] = await db.query(
      'SELECT COUNT(*) as cnt FROM vulnerabilities'
    );

    const [[{ cnt: exercises_total }]] = await db.query('SELECT COUNT(*) as cnt FROM exercises');

    const [[{ cnt: completed_total }]] = await db.query(
      'SELECT COUNT(*) as cnt FROM user_exercises'
    );

    const [userExerciseCounts] = await db.query(`
      SELECT u.id as user_id, u.username, COUNT(ue.exercise_id) as completed_count
      FROM users u
      LEFT JOIN user_exercises ue ON u.id = ue.user_id
      GROUP BY u.id
    `);

    return {
      courses_total,
      exercises_total,
      completed_total,
      userExerciseCounts
    };
  },

  async setUserBlocked({ currentUser, userId, isBlocked }) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user id');
    }

    if (currentUser?.id === userId) {
      throw new Error('You cannot block yourself');
    }

    const target = await UserModel.findById(userId);
    if (!target) {
      throw new Error('User not found');
    }

    const affected = await UserModel.setBlocked(userId, isBlocked);
    if (affected === 0) {
      throw new Error('User not found');
    }

    return {
      message: isBlocked ? 'User blocked' : 'User unblocked',
      userId,
      is_blocked: isBlocked ? 1 : 0
    };
  },

  async getContentFreezeOverview() {
    const [rows] = await db.query(
      `
      SELECT
        v.id AS course_id,
        v.code,
        v.title AS course_title,
        v.description AS course_description,
        v.is_frozen AS course_is_frozen,
        e.id AS exercise_id,
        e.title AS exercise_title,
        e.order_index,
        e.difficulty,
        e.is_frozen AS exercise_is_frozen
      FROM vulnerabilities v
      LEFT JOIN exercises e
        ON e.vulnerability_id = v.id
      ORDER BY v.id ASC, e.order_index ASC
      `
    );

    const courseMap = new Map();

    for (const row of rows) {
      if (!courseMap.has(row.course_id)) {
        courseMap.set(row.course_id, {
          id: row.course_id,
          code: row.code,
          title: row.course_title,
          description: row.course_description,
          is_frozen: normalizeTinyInt(row.course_is_frozen),
          exercises: []
        });
      }

      if (row.exercise_id) {
        const course = courseMap.get(row.course_id);
        course.exercises.push({
          id: row.exercise_id,
          title: row.exercise_title,
          order_index: row.order_index,
          difficulty: row.difficulty,
          is_frozen: normalizeTinyInt(row.exercise_is_frozen)
        });
      }
    }

    return Array.from(courseMap.values()).map((course) => ({
      ...course,
      modules_total: course.exercises.length,
      modules_frozen: course.exercises.filter((ex) => ex.is_frozen === 1).length
    }));
  },

  async setCourseFrozen({ courseId, isFrozen }) {
    if (!Number.isInteger(courseId) || courseId <= 0) {
      throw new Error('Invalid course id');
    }

    const [[course]] = await db.query(
      `
      SELECT id
      FROM vulnerabilities
      WHERE id = ?
      LIMIT 1
      `,
      [courseId]
    );

    if (!course) {
      throw new Error('Course not found');
    }

    await db.query(
      `
      UPDATE vulnerabilities
      SET is_frozen = ?
      WHERE id = ?
      `,
      [normalizeTinyInt(isFrozen), courseId]
    );

    return {
      message: isFrozen ? 'Course frozen' : 'Course unfrozen',
      courseId,
      is_frozen: normalizeTinyInt(isFrozen)
    };
  },

  async setExerciseFrozen({ exerciseId, isFrozen }) {
    if (!Number.isInteger(exerciseId) || exerciseId <= 0) {
      throw new Error('Invalid exercise id');
    }

    const [[exercise]] = await db.query(
      `
      SELECT id
      FROM exercises
      WHERE id = ?
      LIMIT 1
      `,
      [exerciseId]
    );

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    await db.query(
      `
      UPDATE exercises
      SET is_frozen = ?
      WHERE id = ?
      `,
      [normalizeTinyInt(isFrozen), exerciseId]
    );

    return {
      message: isFrozen ? 'Exercise frozen' : 'Exercise unfrozen',
      exerciseId,
      is_frozen: normalizeTinyInt(isFrozen)
    };
  }
};

module.exports = AdminService;
