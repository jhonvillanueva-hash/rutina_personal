import { useState, useEffect } from 'react'
import { checkHealth } from './services/api'

function App() {
  const [healthStatus, setHealthStatus] = useState<{ status: string; db: string; initialized?: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth()
        setHealthStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>RutinaPersonal V1 - Scaffold</h1>
      <h2>Estado de conexión</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <h3>❌ Error de conexión</h3>
          <p>{error}</p>
          <p>No se pudo conectar con el backend. Asegúrate de que el servidor esté corriendo.</p>
        </div>
      ) : healthStatus ? (
        <div style={{ color: healthStatus.status === 'ok' ? 'green' : 'red' }}>
          {healthStatus.status === 'ok' ? (
            <div>
              <h3>✅ Backend conectado</h3>
              <p>Estado: {healthStatus.status}</p>
              <p>Base de datos: {healthStatus.db}</p>
              <p>Inicializado: {healthStatus.initialized ? 'Sí' : 'No'}</p>
            </div>
          ) : (
            <div>
              <h3>❌ Error en el backend</h3>
              <p>Estado: {healthStatus.status}</p>
              <p>Base de datos: {healthStatus.db}</p>
            </div>
          )}
        </div>
      ) : null}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Instrucciones</h3>
        <ol>
          <li>Ejecutar backend: <code>cd backend &amp;&amp; npm run dev</code></li>
          <li>Ejecutar frontend: <code>cd frontend &amp;&amp; npm run dev</code></li>
          <li>Verificar que ambos servicios estén corriendo</li>
        </ol>
      </div>
    </div>
  )
}

export default App