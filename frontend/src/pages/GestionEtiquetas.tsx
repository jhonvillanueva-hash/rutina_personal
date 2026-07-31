import { useState, useEffect } from 'react';
import { listarEtiquetas, crearEtiqueta, actualizarEtiqueta, eliminarEtiqueta } from '../services/etiquetas';
import { Etiqueta } from '../types/etiqueta';

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
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Gestión de Etiquetas</h1>

      {error && (
        <div style={{ color: 'red', padding: '1rem', backgroundColor: '#ffeeee', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2>{editId !== null ? 'Editar Etiqueta' : 'Crear Nueva Etiqueta'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="nombre" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Nombre:
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="duracion" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Duración (segundos):
            </label>
            <input
              type="number"
              id="duracion"
              value={formData.duracion_segundos}
              onChange={(e) => setFormData({ ...formData, duracion_segundos: Number(e.target.value) })}
              min="1"
              max="3600"
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            {editId !== null ? 'Actualizar' : 'Crear'}
          </button>
          {editId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setFormData({ nombre: '', duracion_segundos: 30 });
              }}
              style={{ padding: '0.5rem 1rem', marginLeft: '1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div>
        <h2>Lista de Etiquetas</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : etiquetas.length === 0 ? (
          <p>No hay etiquetas creadas.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Duración (seg)</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Creada</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {etiquetas.map((etiqueta) => (
                <tr key={etiqueta.id}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{etiqueta.nombre}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{etiqueta.duracion_segundos}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{new Date(etiqueta.created_at).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    <button
                      onClick={() => handleEdit(etiqueta)}
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(etiqueta.id)}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}