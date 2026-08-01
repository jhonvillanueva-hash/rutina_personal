import { useState, useEffect } from 'react'
import type { Actividad } from '../types/actividad'
import type { Etiqueta } from '../types/etiqueta'
import { listarActividades, crearActividad, actualizarActividad, eliminarActividad } from '../services/actividades'
import { listarEtiquetas } from '../services/etiquetas'

export default function GestionActividades() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Actividad, 'id' | 'created_at'>>({
    nombre: '',
    etiqueta_id: 0,
  })
  const [editId, setEditId] = useState<number | null>(null)
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  // Inicializar formData con la primera etiqueta después de cargar
  useEffect(() => {
    if (etiquetas.length > 0 && formData.etiqueta_id === 0 && editId === null) {
      console.log('Inicializando etiqueta_id con:', etiquetas[0].id)
      setFormData(prev => ({ ...prev, etiqueta_id: etiquetas[0].id }));
    }
  }, [etiquetas]);

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [acts, etqs] = await Promise.all([
        listarActividades(),
        listarEtiquetas(),
      ])
      setActividades(acts)
      setEtiquetas(etqs)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Enviando formulario con:', formData)
    try {
      if (editId !== null) {
        const updated = await actualizarActividad(editId, formData)
        setActividades(actividades.map(a => (a.id === editId ? updated : a)))
        setEditId(null)
      } else {
        const nueva = await crearActividad(formData)
        setActividades([...actividades, nueva])
      }
      setFormData({ nombre: '', etiqueta_id: etiquetas.length > 0 ? etiquetas[0].id : 0 })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const handleEdit = (actividad: Actividad) => {
    setFormData({
      nombre: actividad.nombre,
      etiqueta_id: actividad.etiqueta_id,
    })
    setEditId(actividad.id)
  }

  const handleDelete = async (id: number) => {
    try {
      await eliminarActividad(id)
      setActividades(actividades.filter(a => a.id !== id))
      setConfirmandoId(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const etiquetaNombre = (id: number) => {
    return etiquetas.find(e => e.id === id)?.nombre || 'Desconocida'
  }

  return (
    <div className="card">
      <h2>{editId !== null ? 'Editar Actividad' : 'Crear Nueva Actividad'}</h2>

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
            <label htmlFor="etiqueta_id">Etiqueta</label>
            <select
              id="etiqueta_id"
              value={formData.etiqueta_id}
              onChange={(e) => {
                console.log('Etiqueta seleccionada:', e.target.value)
                setFormData({ ...formData, etiqueta_id: Number(e.target.value) })
              }}
              required
            >
              {etiquetas.map((etiqueta) => (
                <option key={etiqueta.id} value={etiqueta.id}>
                  {etiqueta.nombre}
                </option>
              ))}
            </select>
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
                setEditId(null)
                setFormData({ nombre: '', etiqueta_id: etiquetas.length > 0 ? etiquetas[0].id : 0 })
              }}
              style={{ marginLeft: '8px' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: '24px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <h2>Lista de Actividades</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : actividades.length === 0 ? (
          <div className="empty-state">No hay actividades creadas.</div>
        ) : (
          <div className="list list-scroll">
            {actividades.map((actividad) => (
              <div key={actividad.id} className="list-item">
                <div className="list-item-main">
                  <div className="list-item-title">{actividad.nombre}</div>
                  <div className="list-item-meta">
                    Etiqueta: {etiquetaNombre(actividad.etiqueta_id)}
                  </div>
                </div>
                <div className="list-item-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(actividad)}
                  >
                    Editar
                  </button>
                  {confirmandoId === actividad.id ? (
                    <>
                      <button
                        className="btn btn-confirm"
                        onClick={() => handleDelete(actividad.id)}
                      >
                        ¿Seguro?
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setConfirmandoId(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={() => setConfirmandoId(actividad.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}