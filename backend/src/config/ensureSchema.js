const db = require('./db');

async function addColumnIfMissing(tableName, columnName, definition) {
  try {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  } catch (err) {
    if (err?.code === 'ER_DUP_FIELDNAME') {
      return;
    }
    throw err;
  }
}

async function ensureFreezeSchema() {
  await addColumnIfMissing('vulnerabilities', 'is_frozen', 'TINYINT(1) NOT NULL DEFAULT 0');

  await addColumnIfMissing('exercises', 'is_frozen', 'TINYINT(1) NOT NULL DEFAULT 0');
}

module.exports = {
  ensureFreezeSchema
};
