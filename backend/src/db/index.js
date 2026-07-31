const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../rutina.db');
const db = new Database(dbPath);

// Inicialización básica de la base de datos
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    )
  `);

  // Insertar un registro de prueba para verificar conexión
  const stmt = db.prepare('INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)');
  stmt.run('initialized', 'true');
}

module.exports = { db, initDb };