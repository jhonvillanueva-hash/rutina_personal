import { useState, useEffect, useRef } from 'react'
import type { Etiqueta } from '../types/etiqueta'
import type { Actividad } from '../types/actividad'
import type { CrearHistorialRutina } from '../types/historial'
import { listarEtiquetas } from '../services/etiquetas'
import { listarActividades } from '../services/actividades'
import { crearRegistroHistorial } from '../services/historial'

type FaseEjecucion = 'seleccion' | 'countdown' | 'ejecutando' | 'transicion' | 'completado'

const formatearTiempo = (segundosTotales: number): string => {
  const minutos = Math.floor(segundosTotales / 60).toString().padStart(2, '0')
  const segundos = (segundosTotales % 60).toString().padStart(2, '0')
  return `${minutos}:${segundos}`
}

const formatearFecha = (fecha: Date): string => {
  const año = fecha.getFullYear()
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
  const día = fecha.getDate().toString().padStart(2, '0')
  return `${año}-${mes}-${día}`
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
  const [duracionTotalFinal, setDuracionTotalFinal] = useState<number>(0)
  const inicioActividadRef = useRef<number>(0)
  const guardadoRef = useRef<boolean>(false)
  const faseRef = useRef<FaseEjecucion>('seleccion')
  const etiquetaNombreRef = useRef<string | null>(null)
  const horaInicioTsRef = useRef<number | null>(null)
  const horaInicioRef = useRef<string | null>(null)

  const etiquetaActiva = etiquetas.find(e => e.id === etiquetaSeleccionada) || null
  const duracionSegundos = etiquetaActiva?.duracion_segundos ?? null
  const actividadActual = actividades[actividadIndex] ?? null

  // Mantiene los valores actuales accesibles para el cleanup de desmontaje
  useEffect(() => {
    faseRef.current = fase
    etiquetaNombreRef.current = etiquetaActiva?.nombre ?? null
    horaInicioTsRef.current = horaInicioTs
    horaInicioRef.current = horaInicio
  })

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
        const inicioTs = horaInicioTsRef.current
        if (inicioTs !== null) {
          setDuracionTotalFinal(Math.max(0, Math.floor((Date.now() - inicioTs) / 1000)))
        }
        setFase('completado')
      } else {
        setActividadIndex(i => i + 1)
        setFase('ejecutando')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [fase, actividadIndex, actividades.length])

  // Guardar sesion completada al llegar a la fase completado
  useEffect(() => {
    if (fase !== 'completado') return
    if (guardadoRef.current) return
    guardadoRef.current = true

    const etiquetaNombre = etiquetaNombreRef.current
    const inicioTs = horaInicioTsRef.current
    if (etiquetaNombre === null || inicioTs === null) {
      setError('No se pudo guardar el historial: faltan datos de la sesión')
      return
    }

    const horaFin = new Date().toLocaleTimeString()
    const duracionTotal = Math.max(0, Math.floor((Date.now() - inicioTs) / 1000))
    const payload: CrearHistorialRutina = {
      etiqueta_nombre: etiquetaNombre,
      fecha: formatearFecha(new Date()),
      hora_inicio: horaInicioRef.current || horaFin,
      hora_fin: horaFin,
      duracion_total_segundos: duracionTotal,
      estado: 'Completada',
    }

    crearRegistroHistorial(payload)
      .then(() => setError(null))
      .catch(err => {
        setError(err instanceof Error ? `No se pudo guardar el historial: ${err.message}` : 'No se pudo guardar el historial')
      })
  }, [fase])

  // Si el componente se desmonta a mitad de la ejecucion, guardar como cancelada
  useEffect(() => {
    return () => {
      if (guardadoRef.current) return
      const faseActual = faseRef.current
      if (faseActual !== 'countdown' && faseActual !== 'ejecutando' && faseActual !== 'transicion') return

      guardadoRef.current = true
      const etiquetaNombre = etiquetaNombreRef.current
      const inicioTs = horaInicioTsRef.current
      if (etiquetaNombre === null || inicioTs === null) return

      const duracionTotal = Math.max(0, Math.floor((Date.now() - inicioTs) / 1000))
      const horaFin = new Date().toLocaleTimeString()
      const payload: CrearHistorialRutina = {
        etiqueta_nombre: etiquetaNombre,
        fecha: formatearFecha(new Date()),
        hora_inicio: horaInicioRef.current || horaFin,
        hora_fin: horaFin,
        duracion_total_segundos: duracionTotal,
        estado: 'Cancelada',
      }

      crearRegistroHistorial(payload).catch(() => {})
    }
  }, [])

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
    guardadoRef.current = false
    setHoraInicio(new Date().toLocaleTimeString())
    setHoraInicioTs(Date.now())
    setTiempoTranscurrido('00:00')
    setDuracionTotalFinal(0)
    setCountdownNumero(5)
    setActividadIndex(0)
    setProgreso(0)
    setError(null)
    setFase('countdown')
  }

  const resetear = () => {
    guardadoRef.current = false
    setFase('seleccion')
    setActividadIndex(0)
    setProgreso(0)
    setCountdownNumero(5)
    setHoraInicio(null)
    setHoraInicioTs(null)
    setTiempoTranscurrido('00:00')
    setDuracionTotalFinal(0)
    setError(null)
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
          <h1 className="completado-titulo">¡Felicidades!</h1>
          <p className="completado-sub">
            Has completado tu rutina de <strong>{etiquetaNombreRef.current || 'esta etiqueta'}</strong>.
          </p>
          <div className="completado-tiempo">
            <span className="completado-tiempo-label">Tiempo total</span>
            <span className="completado-tiempo-valor">{formatearTiempo(duracionTotalFinal)}</span>
          </div>
          <button className="btn btn-primary" onClick={resetear}>
            Volver a selección
          </button>
        </div>
      )}
    </div>
  )
}
