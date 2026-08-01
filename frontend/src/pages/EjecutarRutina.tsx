import { useState, useEffect } from 'react'
import type { Etiqueta } from '../types/etiqueta'
import type { Actividad } from '../types/actividad'
import { listarEtiquetas } from '../services/etiquetas'
import { listarActividades } from '../services/actividades'

export default function EjecutarRutina() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<number | null>(null)
  const [horaInicio, setHoraInicio] = useState<string | null>(null)
  const [rutinaIniciada, setRutinaIniciada] = useState<boolean>(false)

  useEffect(() => {
    cargarEtiquetasConActividades()
  }, [])

  const cargarEtiquetasConActividades = async () => {
    try {
      setLoading(true)
      const data = await listarEtiquetas(true)
      setEtiquetas(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const cargarActividades = async (etiquetaId: number) => {
    try {
      setLoading(true)
      const data = await listarActividades(etiquetaId)
      setActividades(data)
      setEtiquetaSeleccionada(etiquetaId)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleIniciar = () => {
    const ahora = new Date()
    const horaFormateada = ahora.toLocaleTimeString()
    setHoraInicio(horaFormateada)
    setRutinaIniciada(true)
  }

  return (
    <div className="card">
      <h2>Ejecutar Rutina</h2>

      {error && <div className="error-banner">Error: {error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="etiqueta-select" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
          Seleccionar etiqueta:
        </label>
        {loading ? (
          <p>Cargando etiquetas...</p>
        ) : etiquetas.length === 0 ? (
          <div className="empty-state">
            No hay etiquetas con actividades. Crea actividades primero en la pestaña "Actividades".
          </div>
        ) : (
          <select
            id="etiqueta-select"
            value={etiquetaSeleccionada || ''}
            onChange={(e) => cargarActividades(Number(e.target.value))}
            className="field"
            style={{ width: '100%', padding: '10px' }}
          >
            <option value="" disabled>
              -- Selecciona una etiqueta --
            </option>
            {etiquetas.map((etiqueta) => (
              <option key={etiqueta.id} value={etiqueta.id}>
                {etiqueta.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {etiquetaSeleccionada && (
        <div style={{ marginTop: '24px' }}>
          <h3>Actividades a ejecutar</h3>
          {loading ? (
            <p>Cargando actividades...</p>
          ) : actividades.length === 0 ? (
            <div className="empty-state">
              No hay actividades para esta etiqueta.
            </div>
          ) : (
            <div className="list">
              {actividades.map((actividad) => (
                <div key={actividad.id} className="list-item">
                  <div className="list-item-main">
                    <div className="list-item-title">{actividad.nombre}</div>
                    <div className="list-item-meta">
                      {actividad.duracion_segundos} segundos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Control de ejecución</h3>
          {!rutinaIniciada && (
            <button
              className="btn btn-primary"
              onClick={handleIniciar}
              disabled={!etiquetaSeleccionada || actividades.length === 0}
            >
              Iniciar
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', fontSize: '0.9rem' }}>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              Hora de inicio
            </div>
            <div style={{ fontWeight: 600 }}>
              {horaInicio || '--:--:--'}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              Hora de fin
            </div>
            <div style={{ fontWeight: 600 }}>
              {rutinaIniciada ? '--' : '--:--:--'}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
              Tiempo total
            </div>
            <div style={{ fontWeight: 600 }}>
              {rutinaIniciada ? '--' : '--:--:--'}
            </div>
          </div>
        </div>

        {rutinaIniciada && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--color-accent-soft)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-accent-dark)' }}>
              Rutina iniciada. La ejecución automática con countdown y barra de progreso se implementará en la siguiente fase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}