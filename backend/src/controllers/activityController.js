const activityService = require('../services/activityService');

async function getUserActivityFeed(req, res) {
  try {
    const userId = req.user.id;
    const feed = await activityService.getUserActivityFeed(userId);
    res.json(feed);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка получения ленты активности' });
  }
}

module.exports = { getUserActivityFeed };
