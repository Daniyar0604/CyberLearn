const exerciseModel = require('../models/exerciseModel');
const userExerciseModel = require('../models/userExerciseModel');

/**
 * Получить одно задание по коду уязвимости и порядковому номеру
 */
async function getByOrder(code, order) {
  const exercise = await exerciseModel.findByCodeAndOrder(code, order);

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  return exercise;
}

/**
 * Получить все задания по коду уязвимости
 */
async function getAllByCode(code) {
  const exercises = await exerciseModel.findAllByCode(code);

  if (!exercises || exercises.length === 0) {
    throw new Error('No exercises for this vulnerability');
  }

  return exercises;
}

/**
 * Получить задание + статус выполнения
 */
async function getByOrderWithStatus(code, order, userId) {
  const exercise = await exerciseModel.findByCodeAndOrder(code, order);

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  const completed = await userExerciseModel.isCompleted(
    null,
    userId,
    exercise.id
  );

  return {
    ...exercise,
    completed
  };
}

module.exports = {
  getByOrder,
  getAllByCode,
  getByOrderWithStatus
};
