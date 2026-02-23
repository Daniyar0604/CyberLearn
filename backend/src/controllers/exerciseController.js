const exerciseService = require('../services/exercisesService');

async function getByOrder(req, res) {
  const { code, order } = req.params;

  // ✅ НОРМАЛИЗАЦИЯ
  const orderIndex = parseInt(order, 10);
  if (!code || !Number.isInteger(orderIndex)) {
    return res.status(400).json({
      message: 'Invalid exercise params',
      received: { code, order }
    });
  }

  try {
    const userId = req.user.id;

    const exercise = await exerciseService.getByOrderWithStatus(
      code,
      orderIndex,
      userId
    );

    res.json(exercise);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

async function getAllByCode(req, res) {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ message: 'Invalid code' });
  }

  try {
    const exercises = await exerciseService.getAllByCode(code);
    res.json(exercises);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

async function getAllStatus(req, res) {
  try {
    const userId = req.user.id;
    const exercises = await exerciseService.getAllWithStatus(userId);
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getByOrder,
  getAllByCode,
  getAllStatus
};
