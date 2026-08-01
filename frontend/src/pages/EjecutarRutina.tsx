import { useState, useEffect, useRef } from 'react'
import type { Etiqueta } from '../types/etiqueta'
import type { Actividad } from '../types/actividad'
import { listarEtiquetas } from '../services/etiquetas'
import { listarActividades } from '../services/actividades'

type FaseEjecucion = 'seleccion' | 'countdown' | 'ejecutando' | 'transicion' | 'completado'

const formatearTiempo = (segundosTotales: number): string => {
  const minutos = Math.floor(segundosTotales / 60).toString().padStart(2, '0')
  const segundos = (segundosTotales % 60).toString().padStart(2, '0')
  return `${minutos}:${segundos}`
}

export default function EjecutarRutina() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<number | null>(null)
  const [fase, setFase] = useState<FaseEjecucion>('seleccion')
  const [actividadIndex, setActividadIndex] = useState<number>(0)
  const [progreso, setProgreso] = useState<number>(0)
  const [countdownNumero, setCountdownNumero] = useState<number>(5)
  const [horaInicio, setHoraInicio] = useState<string | null>(null)
  const [horaInicioTs, setHoraInicioTs] = useState<number | null>(null)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<string>('00:00')
  const inicioActividadRef = useRef<number>(0)

  const etiquetaActiva = etiquetas.find(e => e.id === etiquetaSeleccionada) || null
  const duracionSegundos = etiquetaActiva?.duracion_segundos ?? null
  const actividadActual = actividades[actividadIndex] ?? null

  useEffect(() => {
    cargarEtiquetasConActividades()
  }, [])

  // Cuenta regresiva 5 -> 4 -> 3 -> 2 -> 1
  useEffect(() => {
    if (fase !== 'countdown') return
    if (countdownNumero <= 0) {
      setActividadIndex(0)
      setProgreso(0)
      setFase('ejecutando')
      return
    }
    const timer = setTimeout(() => {
      setCountdownNumero(n => n - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [fase, countdownNumero])

  // Progreso de la actividad actual en tiempo real (basado en Date.now)
  useEffect(() => {
    if (fase !== 'ejecutando' || duracionSegundos === null || duracionSegundos <= 0) return
    inicioActividadRef.current = Date.now()
    setProgreso(0)
    const duracionMs = duracionSegundos * 1000
    const interval = setInterval(() => {
      const transcurrido = Date.now() - inicioActividadRef.current
      const pct = Math.min(transcurrido / duracionMs, 1)
      setProgreso(pct)
      if (pct >= 1) {
        clearInterval(interval)
        reproducirPitido()
        setFase('transicion')
      }
    }, 100)
    return () => clearInterval(interval)
  }, [fase, actividadIndex, duracionSegundos])

  // Transicion de 2 segundos entre actividades
  useEffect(() => {
    if (fase !== 'transicion') return
    const timer = setTimeout(() => {
      if (actividadIndex + 1 >= actividades.length) {
        setFase('completado')
      } else {
        setActividadIndex(i => i + 1)
        setFase('ejecutando')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [fase, actividadIndex, actividades.length])

  // Tiempo transcurrido durante la ejecucion
  useEffect(() => {
    if (fase !== 'countdown' && fase !== 'ejecutando' && fase !== 'transicion') return
    const interval = setInterval(() => {
      if (horaInicioTs !== null) {
        const segundos = Math.floor((Date.now() - horaInicioTs) / 1000)
        setTiempoTranscurrido(formatearTiempo(segundos))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [fase, horaInicioTs])

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

  const reproducirPitido = () => {
    try {
      const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextCtor) {
        console.error('Web Audio API no soportada')
        return
      }
      const contexto = new AudioContextCtor()
      const oscilador = contexto.createOscillator()
      const ganancia = contexto.createGain()
      oscilador.type = 'sine'
      oscilador.frequency.value = 900
      ganancia.gain.setValueAtTime(0.0001, contexto.currentTime)
      ganancia.gain.exponentialRampToValueAtTime(0.6, contexto.currentTime + 0.02)
      ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.3)
      oscilador.connect(ganancia)
      ganancia.connect(contexto.destination)
      oscilador.start()
      oscilador.stop(contexto.currentTime + 0.35)
      oscilador.onended = () => {
        contexto.close().catch(() => {})
      }
    } catch (err) {
      console.error('Error al reproducir pitido:', err)
    }
  }

  const handleIniciar = () => {
    setHoraInicio(new Date().toLocaleTimeString())
    setHoraInicioTs(Date.now())
    setTiempoTranscurrido('00:00')
    setCountdownNumero(5)
    setActividadIndex(0)
    setProgreso(0)
    setFase('countdown')
  }

  const resetear = () => {
    setFase('seleccion')
    setActividadIndex(0)
    setProgreso(0)
    setCountdownNumero(5)
    setHoraInicio(null)
    setHoraInicioTs(null)
    setTiempoTranscurrido('00:00')
  }

  return (
    <div className={`card ${fase !== 'seleccion' ? 'card-ejecucion' : ''}`}>
      {error && <div className="error-banner">Error: {error}</div>}

      {fase === 'seleccion' && (
        <>
          <div className="field field-compact" style={{ marginBottom: '24px' }}>
            <label htmlFor="etiqueta-select">Seleccionar etiqueta</label>
            {loading ? (
              <p>Cargando etiquetas...</p>
            ) : etiquetas.length === 0 ? (
              <div className="empty-state">
                No hay etiquetas con actividades. Crea actividades primero en la pestaña "Actividades".
              </div>
            ) : (
              <select
                id="etiqueta-select"
                value={etiquetaSeleccionada ?? ''}
                onChange={(e) => cargarActividades(Number(e.target.value))}
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
            <div className="activity-list-wrap">
              <h3>Actividades a ejecutar</h3>
              {loading ? (
                <p>Cargando actividades...</p>
              ) : actividades.length === 0 ? (
                <div className="empty-state">
                  No hay actividades para esta etiqueta.
                </div>
              ) : (
                <div className="list list-scroll">
                  {actividades.map((actividad) => (
                    <div key={actividad.id} className="list-item activity-preview-item">
                      <div className="list-item-main">
                        <div className="list-item-title">{actividad.nombre}</div>
                        <div className="list-item-meta">
                          {duracionSegundos !== null && (
                            <span className="duration">{duracionSegundos}s</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Control de ejecución</h3>
              <button
                className="btn btn-primary"
                onClick={handleIniciar}
                disabled={!etiquetaSeleccionada || actividades.length === 0}
              >
                Iniciar
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  Hora de inicio
                </div>
                <div className="time-value">
                  {horaInicio || '--:--:--'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  Hora de fin
                </div>
                <div className="time-value">
                  --:--:--
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                  Tiempo total
                </div>
                <div className="time-value">
                  --:--:--
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {fase === 'countdown' && (
        <div className="fase-fullscreen">
          <div className="countdown-numero">{countdownNumero}</div>
          <div className="countdown-sub">Prepárate...</div>
        </div>
      )}

      {(fase === 'ejecutando' || fase === 'transicion') && (
        <div className="fase-fullscreen">
          <div className="fase-info-superior">
            <span>Inicio: {horaInicio || '--:--:--'}</span>
            <span>Transcurrido: {tiempoTranscurrido}</span>
          </div>
          <div className={`ejecucion-contenido ${fase === 'transicion' ? 'saliente' : ''}`}>
            <div className="ejecucion-contador">
              Actividad {actividadIndex + 1} de {actividades.length}
            </div>
            <h1 className="ejecucion-nombre">{actividadActual?.nombre}</h1>
            <div className="progreso-barra">
              <div className="progreso-lleno" style={{ width: `${Math.round(progreso * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {fase === 'completado' && (
        <div className="fase-fullscreen">
          <h1 className="completado-titulo">Rutina completada</h1>
          <p className="completado-sub">Has terminado todas las actividades.</p>
          <button className="btn btn-primary" onClick={resetear}>
            Volver a selección
          </button>
        </div>
      )}
    </div>
  )
}
