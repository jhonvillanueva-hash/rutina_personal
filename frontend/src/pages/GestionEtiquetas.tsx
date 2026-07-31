import { useState, useEffect } from 'react';
import type { Etiqueta } from '../types/etiqueta';
import { listarEtiquetas, crearEtiqueta, actualizarEtiqueta, eliminarEtiqueta } from '../services/etiquetas';

export default function GestionEtiquetas() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Etiqueta, 'id' | 'created_at'>>({
    nombre: '',
    duracion_segundos: 30,
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  const cargarEtiquetas = async () => {
    try {
      setLoading(true);
      const data = await listarEtiquetas();
      setEtiquetas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId !== null) {
        const updated = await actualizarEtiqueta(editId, formData);
        setEtiquetas(etiquetas.map(e => (e.id === editId ? updated : e)));
        setEditId(null);
      } else {
        const nueva = await crearEtiqueta(formData);
        setEtiquetas([...etiquetas, nueva]);
      }
      setFormData({ nombre: '', duracion_segundos: 30 });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleEdit = (etiqueta: Etiqueta) => {
    setFormData({
      nombre: etiqueta.nombre,
      duracion_segundos: etiqueta.duracion_segundos,
    });
    setEditId(etiqueta.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta etiqueta?')) {
      try {
        await eliminarEtiqueta(id);
        setEtiquetas(etiquetas.filter(e => e.id !== id));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    }
  };

  return (
    <div className="card">
      <h2>{editId !== null ? 'Editar Etiqueta' : 'Crear Nueva Etiqueta'}</h2>

      {error && <div className="error-banner">Error: {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="duracion">Duración (segundos)</label>
            <input
              type="number"
              id="duracion"
              value={formData.duracion_segundos}
              onChange={(e) => setFormData({ ...formData, duracion_segundos: Number(e.target.value) })}
              min="1"
              max="3600"
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary">
            {editId !== null ? 'Actualizar' : 'Crear'}
          </button>
          {editId !== null && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditId(null);
                setFormData({ nombre: '', duracion_segundos: 30 });
              }}
              style={{ marginLeft: '8px' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: '24px' }}>
        <h2>Lista de Etiquetas</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : etiquetas.length === 0 ? (
          <div className="empty-state">No hay etiquetas creadas.</div>
        ) : (
          <div className="list">
            {etiquetas.map((etiqueta) => (
              <div key={etiqueta.id} className="list-item">
                <div className="list-item-main">
                  <div className="list-item-title">{etiqueta.nombre}</div>
                  <div className="list-item-meta">
                    Duración: {etiqueta.duracion_segundos} segundos
                  </div>
                </div>
                <div className="list-item-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(etiqueta)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(etiqueta.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}