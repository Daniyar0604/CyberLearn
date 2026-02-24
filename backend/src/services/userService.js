const UserModel = require('../models/userModel');
const userExerciseModel = require('../models/userExerciseModel');

async function getMe(userId) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const completedExercises = await userExerciseModel.countByUser(userId);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    level: user.level,
    study_hours: user.study_hours,
    completed_exercises: completedExercises,
    created_at: user.created_at
  };
}

/**
 * Увеличивает накопительное время обучения пользователя (в минутах)
 */
async function addStudyTime(userId, minutes) {
  if (!Number.isInteger(minutes) || minutes <= 0) {
    return;
  }

  // защита от аномалий (например, вкладка была открыта сутки)
  if (minutes > 480) {
    return;
  }

  await UserModel.incrementStudyTime(userId, minutes);
}

async function getMyRating(userId) {
  const rating = await UserModel.getUserRating(userId);

  if (!rating) {
    throw new Error('User not found');
  }

  return {
    rank: Number(rating.rank_position || 0),
    totalParticipants: Number(rating.total_participants || 0),
    completedExercises: Number(rating.completed_count || 0)
  };
}

module.exports = {
  getMe,
  addStudyTime,
  getMyRating
};
