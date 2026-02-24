const progressModel = require('../models/progressModel');

async function getVulnerabilityProgress(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.params;

    const progress = await progressModel.getProgressByVulnerability(userId, code);

    res.json(progress);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка получения прогресса' });
  }
}

module.exports = {
  getVulnerabilityProgress
};
