const exerciseModel = require('../models/exerciseModel');
const userExerciseModel = require('../models/userExerciseModel');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function ensureExerciseIsAccessible(exercise) {
  if (Number(exercise.course_is_frozen) === 1) {
    throw httpError(403, 'Course is temporarily unavailable');
  }

  if (Number(exercise.is_frozen) === 1) {
    throw httpError(403, 'Exercise is temporarily unavailable');
  }
}

async function getAllByCode(code) {
  const exercises = await exerciseModel.findAllByCode(code);

  if (!exercises || exercises.length === 0) {
    throw httpError(404, 'No exercises for this vulnerability');
  }

  if (Number(exercises[0].course_is_frozen) === 1) {
    throw httpError(403, 'Course is temporarily unavailable');
  }

  return exercises;
}

async function getByOrderWithStatus(code, order, userId) {
  const exercise = await exerciseModel.findByCodeAndOrder(code, order);

  if (!exercise) {
    throw httpError(404, 'Exercise not found');
  }

  ensureExerciseIsAccessible(exercise);

  const completed = await userExerciseModel.isCompleted(null, userId, exercise.id);

  return {
    ...exercise,
    completed
  };
}

async function getAllWithStatus(userId) {
  const exercises = await exerciseModel.findAllWithStatus(userId);

  return exercises.filter((ex) => Number(ex.is_frozen) === 0 && Number(ex.course_is_frozen) === 0);
}

module.exports = {
  getAllByCode,
  getByOrderWithStatus,
  getAllWithStatus
};
