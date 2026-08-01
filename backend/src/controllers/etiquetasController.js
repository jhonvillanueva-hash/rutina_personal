const { db } = require('../db');
const Etiqueta = require('../models/Etiqueta');

const MAX_DURACION = 3600; // 1 hora en segundos

const etiquetasController = {
  // Listar todas las etiquetas
  listar: (req, res) => {
    try {
      let query = 'SELECT DISTINCT e.* FROM etiquetas e';
      const params = [];

      if (req.query.con_actividades === 'true') {
        query += ' JOIN actividades a ON e.id = a.etiqueta_id';
      }

      query += ' ORDER BY e.nombre ASC';

      const rows = db.prepare(query).all(...params);
      const etiquetas = rows.map(row => Etiqueta.fromRow(row));
      res.json(etiquetas);
    } catch (error) {
      console.error('Error listando etiquetas:', error);
      res.status(500).json({ error: 'Error al listar etiquetas' });
    }
  },

  // Crear una nueva etiqueta
  crear: (req, res) => {
    const { nombre, duracion_segundos } = req.body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio y no puede estar vacío' });
    }

    if (nombre.length > 100) {
      return res.status(400).json({ error: 'El nombre no puede exceder 100 caracteres' });
    }

    if (duracion_segundos === undefined || duracion_segundos === null) {
      return res.status(400).json({ error: 'La duración en segundos es obligatoria' });
    }

    const duracion = Number(duracion_segundos);
    if (isNaN(duracion) || !Number.isInteger(duracion) || duracion <= 0) {
      return res.status(400).json({ error: 'La duración debe ser un entero positivo' });
    }

    if (duracion > MAX_DURACION) {
      return res.status(400).json({ error: `La duración máxima permitida es ${MAX_DURACION} segundos (1 hora)` });
    }

    try {
      console.log('Creando etiqueta:', { nombre, duracion_segundos: duracion });
      const stmt = db.prepare('INSERT INTO etiquetas (nombre, duracion_segundos) VALUES (?, ?)');
      const result = stmt.run(nombre.trim(), duracion);
      const nuevaEtiqueta = db.prepare('SELECT * FROM etiquetas WHERE id = ?').get(result.lastInsertRowid);
      console.log('Etiqueta creada:', nuevaEtiqueta);
      res.status(201).json(Etiqueta.fromRow(nuevaEtiqueta));
    } catch (error) {
      console.error('Error creando etiqueta:', error);
      res.status(500).json({ error: 'Error al crear etiqueta' });
    }
  },

  // Actualizar una etiqueta
  actualizar: (req, res) => {
    const { id } = req.params;
    const { nombre, duracion_segundos } = req.body;

    // Validar que la etiqueta existe
    const etiquetaExistente = db.prepare('SELECT * FROM etiquetas WHERE id = ?').get(id);
    if (!etiquetaExistente) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    // Validaciones
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre no puede estar vacío' });
      }
      if (nombre.length > 100) {
        return res.status(400).json({ error: 'El nombre no puede exceder 100 caracteres' });
      }
    }

    if (duracion_segundos !== undefined) {
      const duracion = Number(duracion_segundos);
      if (isNaN(duracion) || !Number.isInteger(duracion) || duracion <= 0) {
        return res.status(400).json({ error: 'La duración debe ser un entero positivo' });
      }
      if (duracion > MAX_DURACION) {
        return res.status(400).json({ error: `La duración máxima permitida es ${MAX_DURACION} segundos (1 hora)` });
      }
    }

    try {
      const updates = [];
      const values = [];

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre.trim());
      }

      if (duracion_segundos !== undefined) {
        updates.push('duracion_segundos = ?');
        values.push(Number(duracion_segundos));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
      }

      values.push(id);
      const query = `UPDATE etiquetas SET ${updates.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(query);
      stmt.run(...values);

      const etiquetaActualizada = db.prepare('SELECT * FROM etiquetas WHERE id = ?').get(id);
      res.json(Etiqueta.fromRow(etiquetaActualizada));
    } catch (error) {
      console.error('Error actualizando etiqueta:', error);
      res.status(500).json({ error: 'Error al actualizar etiqueta' });
    }
  },

  // Eliminar una etiqueta
  eliminar: (req, res) => {
    const { id } = req.params;

    // Validar que la etiqueta existe
    const etiquetaExistente = db.prepare('SELECT * FROM etiquetas WHERE id = ?').get(id);
    if (!etiquetaExistente) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    // Check: No eliminar etiqueta con actividades asociadas
    const actividadesCount = db.prepare('SELECT COUNT(*) as count FROM actividades WHERE etiqueta_id = ?').get(id);
    if (actividadesCount.count > 0) {
      return res.status(409).json({ error: 'No se puede eliminar una etiqueta que tiene actividades asociadas' });
    }

    try {
      const stmt = db.prepare('DELETE FROM etiquetas WHERE id = ?');
      stmt.run(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error eliminando etiqueta:', error);
      res.status(500).json({ error: 'Error al eliminar etiqueta' });
    }
  }
};

module.exports = etiquetasController;