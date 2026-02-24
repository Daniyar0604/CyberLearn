const userService = require('../services/userService');

async function getMe(req, res) {
  try {
    const user = await userService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
}

async function addStudyTime(req, res) {
  try {
    const userId = req.user.id;
    const { minutes } = req.body;

    console.log('ADD STUDY TIME:', userId, minutes);
    // базовая валидация
    if (!Number.isInteger(minutes) || minutes <= 0) {
      return res.json({ status: 'ignored' });
    }

    // защита от накрутки (макс 8 часов за сессию)
    if (minutes > 480) {
      return res.status(400).json({ message: 'Too much study time' });
    }

    await userService.addStudyTime(userId, minutes);

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add study time' });
  }
}

async function getMyRating(req, res) {
  try {
    const rating = await userService.getMyRating(req.user.id);
    res.json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user rating' });
  }
}

module.exports = {
  getMe,
  addStudyTime,
  getMyRating
};
