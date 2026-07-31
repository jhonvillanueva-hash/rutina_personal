-- Migración para crear la tabla etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL CHECK(LENGTH(TRIM(nombre)) > 0 AND LENGTH(nombre) <= 100),
  duracion_segundos INTEGER NOT NULL CHECK(duracion_segundos > 0 AND duracion_segundos <= 3600),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda por nombre
CREATE INDEX IF NOT EXISTS idx_etiquetas_nombre ON etiquetas(nombre);