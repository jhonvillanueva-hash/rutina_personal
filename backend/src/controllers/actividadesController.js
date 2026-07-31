const { db } = require('../db');
const Actividad = require('../models/Actividad');

const actividadesController = {
  // Listar todas las actividades
  listar: (req, res) => {
    try {
      let query = 'SELECT * FROM actividades ORDER BY created_at DESC';
      const params = [];

      if (req.query.etiqueta_id) {
        query += ' WHERE etiqueta_id = ?';
        params.push(req.query.etiqueta_id);
      }

      const rows = db.prepare(query).all(...params);
      const actividades = rows.map(row => Actividad.fromRow(row));
      res.json(actividades);
    } catch (error) {
      console.error('Error listando actividades:', error);
      res.status(500).json({ error: 'Error al listar actividades' });
    }
  },

  // Crear una nueva actividad
  crear: (req, res) => {
    const { nombre, etiqueta_id } = req.body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio y no puede estar vacío' });
    }

    if (etiqueta_id === undefined || etiqueta_id === null) {
      return res.status(400).json({ error: 'La etiqueta es obligatoria' });
    }

    // Verificar que la etiqueta existe
    console.log('Buscando etiqueta con ID:', etiqueta_id);
    const etiqueta = db.prepare('SELECT id FROM etiquetas WHERE id = ?').get(etiqueta_id);
    console.log('Etiqueta encontrada:', etiqueta);
    if (!etiqueta) {
      console.log('Etiquetas disponibles:', db.prepare('SELECT * FROM etiquetas').all());
      return res.status(400).json({ error: 'La etiqueta seleccionada no existe' });
    }

    try {
      const stmt = db.prepare('INSERT INTO actividades (nombre, etiqueta_id) VALUES (?, ?)');
      const result = stmt.run(nombre.trim(), etiqueta_id);
      const nuevaActividad = db.prepare('SELECT * FROM actividades WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(Actividad.fromRow(nuevaActividad));
    } catch (error) {
      console.error('Error creando actividad:', error);
      res.status(500).json({ error: 'Error al crear actividad' });
    }
  },

  // Actualizar una actividad
  actualizar: (req, res) => {
    const { id } = req.params;
    const { nombre, etiqueta_id } = req.body;

    // Validar que la actividad existe
    const actividadExistente = db.prepare('SELECT * FROM actividades WHERE id = ?').get(id);
    if (!actividadExistente) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Validaciones
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre no puede estar vacío' });
      }
    }

    if (etiqueta_id !== undefined) {
      // Verificar que la etiqueta existe
      const etiqueta = db.prepare('SELECT id FROM etiquetas WHERE id = ?').get(etiqueta_id);
      if (!etiqueta) {
        return res.status(400).json({ error: 'La etiqueta seleccionada no existe' });
      }
    }

    try {
      const updates = [];
      const values = [];

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre.trim());
      }

      if (etiqueta_id !== undefined) {
        updates.push('etiqueta_id = ?');
        values.push(Number(etiqueta_id));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
      }

      values.push(id);
      const query = `UPDATE actividades SET ${updates.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(query);
      stmt.run(...values);

      const actividadActualizada = db.prepare('SELECT * FROM actividades WHERE id = ?').get(id);
      res.json(Actividad.fromRow(actividadActualizada));
    } catch (error) {
      console.error('Error actualizando actividad:', error);
      res.status(500).json({ error: 'Error al actualizar actividad' });
    }
  },

  // Eliminar una actividad
  eliminar: (req, res) => {
    const { id } = req.params;

    // Validar que la actividad existe
    const actividadExistente = db.prepare('SELECT * FROM actividades WHERE id = ?').get(id);
    if (!actividadExistente) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    try {
      const stmt = db.prepare('DELETE FROM actividades WHERE id = ?');
      stmt.run(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      res.status(500).json({ error: 'Error al eliminar actividad' });
    }
  }
};

module.exports = actividadesController;