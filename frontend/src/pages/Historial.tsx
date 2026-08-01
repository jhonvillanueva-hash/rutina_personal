import { useState, useEffect } from 'react'
import type { HistorialRutina } from '../types/historial'
import { listarHistorial } from '../services/historial'

const formatearTiempo = (segundosTotales: number): string => {
  const minutos = Math.floor(segundosTotales / 60).toString().padStart(2, '0')
  const segundos = (segundosTotales % 60).toString().padStart(2, '0')
  return `${minutos}:${segundos}`
}

const formatearFecha = (fecha: string): string => {
  const partes = fecha.split('-')
  if (partes.length !== 3) return fecha
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

export default function Historial() {
  const [sesiones, setSesiones] = useState<HistorialRutina[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarHistorial()
  }, [])

  const cargarHistorial = async () => {
    try {
      setLoading(true)
      const data = await listarHistorial()
      setSesiones(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Historial de rutinas</h2>

      {error && <div className="error-banner">Error: {error}</div>}

      <div style={{ marginTop: '24px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <p>Cargando...</p>
        ) : sesiones.length === 0 ? (
          <div className="empty-state">
            Todavía no has completado ninguna rutina.
          </div>
        ) : (
          <div className="list list-scroll">
            {sesiones.map((sesion) => (
              <div key={sesion.id} className="list-item">
                <div className="list-item-main">
                  <div className="list-item-title">{sesion.etiqueta_nombre}</div>
                  <div className="list-item-meta">
                    {formatearFecha(sesion.fecha)} · Inicio: {sesion.hora_inicio} · Fin: {sesion.hora_fin}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span className="duration">{formatearTiempo(sesion.duracion_total_segundos)}</span>
                  <span
                    className="duration"
                    style={
                      sesion.estado === 'Cancelada'
                        ? { color: 'var(--danger)', background: 'var(--danger-soft)' }
                        : undefined
                    }
                  >
                    {sesion.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
