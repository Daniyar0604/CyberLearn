const progressModel = require('../models/progressModel');

async function getVulnerabilityProgress(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.params;

    const progress = await progressModel.getProgressByVulnerability(
      userId,
      code
    );

    res.json(progress);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка получения прогресса' });
  }
}

async function getAllProgress(req, res) {
  try {
    const userId = req.user.id;
    const progress = await progressModel.getAllProgress(userId);

    const enriched = progress.map(p => {
      let difficulty = 'Medium';
      let color = 'blue';

      if (p.code === 'xss') {
        difficulty = 'Easy';
        color = 'emerald';
      } else if (p.code === 'rce') {
        difficulty = 'Hard';
        color = 'red';
      } else if (p.code === 'sql') {
        difficulty = 'Medium';
        color = 'blue';
      }

      return {
        ...p,
        difficulty,
        color
      };
    });

    res.json(enriched);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка получения общего прогресса' });
  }
}

module.exports = {
  getVulnerabilityProgress,
  getAllProgress
};
