-- Migración para crear la tabla actividades
CREATE TABLE IF NOT EXISTS actividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL CHECK(LENGTH(TRIM(nombre)) > 0),
  etiqueta_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

-- Índice para búsqueda por etiqueta
CREATE INDEX IF NOT EXISTS idx_actividades_etiqueta ON actividades(etiqueta_id);