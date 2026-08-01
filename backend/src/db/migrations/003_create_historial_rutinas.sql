-- Migración para crear la tabla historial_rutinas
CREATE TABLE IF NOT EXISTS historial_rutinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  etiqueta_nombre TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  duracion_total_segundos INTEGER NOT NULL,
  estado TEXT NOT NULL CHECK(estado IN ('Completada', 'Cancelada')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para ordenar por fecha de ejecución
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_rutinas(fecha);
