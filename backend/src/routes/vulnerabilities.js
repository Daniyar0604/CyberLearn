const express = require('express');
const router = express.Router();
const vulnerabilityController = require('../controllers/vulnerabilityController');

router.get('/', vulnerabilityController.getAll);
router.get('/:code', vulnerabilityController.getByCode);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// /**
//  * GET /api/vulnerabilities
//  */
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT id, code, title, description FROM vulnerabilities ORDER BY id`
//     );
//     res.json({ vulnerabilities: rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// /**
//  * GET /api/vulnerabilities/:code
//  */
// router.get('/:code', async (req, res) => {
//   try {
//     const code = req.params.code.toLowerCase();

//     const [rows] = await db.query(
//       `SELECT id, code, title, description FROM vulnerabilities WHERE code = ? LIMIT 1`,
//       [code]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ message: 'Not found' });
//     }

//     res.json({ vulnerability: rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
