const userExerciseModel = require('../models/userExerciseModel');
const exerciseModel = require('../models/exerciseModel');

async function completeExercise(req, res) {
  try {
    const userId = req.user.id;
    const exerciseId = Number(req.params.exerciseId);

    if (!exerciseId) {
      return res.status(400).json({ message: 'Invalid exercise id' });
    }

    const exercise = await exerciseModel.findForAccessById(exerciseId);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    if (Number(exercise.is_frozen) === 1 || Number(exercise.course_is_frozen) === 1) {
      return res.status(403).json({
        message: 'Exercise is temporarily unavailable'
      });
    }

    const completed = await userExerciseModel.isCompleted(null, userId, exerciseId);

    if (completed) {
      return res.json({
        status: 'success',
        alreadyCompleted: true
      });
    }

    await userExerciseModel.create(null, userId, exerciseId);

    return res.json({
      status: 'success',
      alreadyCompleted: false
    });
  } catch (err) {
    console.error('Complete exercise error:', err);
    return res.status(500).json({ message: 'Failed to complete exercise' });
  }
}

module.exports = {
  completeExercise
};
