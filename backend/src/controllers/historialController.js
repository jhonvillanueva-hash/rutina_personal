const { db } = require('../db');
const HistorialRutina = require('../models/HistorialRutina');

const ESTADOS_VALIDOS = ['Completada', 'Cancelada'];

const historialController = {
  // Listar sesiones guardadas, de la más reciente a la más antigua
  listar: (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM historial_rutinas ORDER BY created_at DESC').all();
      const registros = rows.map(row => HistorialRutina.fromRow(row));
      res.json(registros);
    } catch (error) {
      console.error('Error listando historial:', error);
      res.status(500).json({ error: 'Error al listar el historial' });
    }
  },

  // Crear un registro de rutina finalizada o cancelada
  crear: (req, res) => {
    const { etiqueta_nombre, fecha, hora_inicio, hora_fin, duracion_total_segundos, estado } = req.body;

    // Validaciones
    if (!etiqueta_nombre || typeof etiqueta_nombre !== 'string' || etiqueta_nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la etiqueta es obligatorio y no puede estar vacío' });
    }

    if (etiqueta_nombre.length > 100) {
      return res.status(400).json({ error: 'El nombre de la etiqueta no puede exceder 100 caracteres' });
    }

    if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') {
      return res.status(400).json({ error: 'La fecha es obligatoria y no puede estar vacía' });
    }

    if (!hora_inicio || typeof hora_inicio !== 'string' || hora_inicio.trim() === '') {
      return res.status(400).json({ error: 'La hora de inicio es obligatoria y no puede estar vacía' });
    }

    if (!hora_fin || typeof hora_fin !== 'string' || hora_fin.trim() === '') {
      return res.status(400).json({ error: 'La hora de fin es obligatoria y no puede estar vacía' });
    }

    if (duracion_total_segundos === undefined || duracion_total_segundos === null) {
      return res.status(400).json({ error: 'La duración total en segundos es obligatoria' });
    }

    const duracion = Number(duracion_total_segundos);
    if (isNaN(duracion) || !Number.isInteger(duracion) || duracion < 0) {
      return res.status(400).json({ error: 'La duración total debe ser un entero mayor o igual a 0' });
    }

    if (!estado || typeof estado !== 'string' || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `El estado debe ser 'Completada' o 'Cancelada'` });
    }

    try {
      const stmt = db.prepare(
        'INSERT INTO historial_rutinas (etiqueta_nombre, fecha, hora_inicio, hora_fin, duracion_total_segundos, estado) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const result = stmt.run(etiqueta_nombre.trim(), fecha.trim(), hora_inicio.trim(), hora_fin.trim(), duracion, estado);
      const nuevoRegistro = db.prepare('SELECT * FROM historial_rutinas WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(HistorialRutina.fromRow(nuevoRegistro));
    } catch (error) {
      console.error('Error creando registro de historial:', error);
      res.status(500).json({ error: 'Error al crear registro de historial' });
    }
  }
};

module.exports = historialController;
