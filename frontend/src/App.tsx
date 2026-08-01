import { useState } from 'react'
import GestionEtiquetas from './pages/GestionEtiquetas'
import GestionActividades from './pages/GestionActividades'
import EjecutarRutina from './pages/EjecutarRutina'
import Historial from './pages/Historial'

export default function App() {
  const [activeTab, setActiveTab] = useState<'etiquetas' | 'actividades' | 'ejecutar' | 'historial'>('etiquetas')

  return (
    <div className="app-shell">
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'etiquetas' ? 'active' : ''}`}
          onClick={() => setActiveTab('etiquetas')}
        >
          Etiquetas
        </button>
        <button
          className={`nav-tab ${activeTab === 'actividades' ? 'active' : ''}`}
          onClick={() => setActiveTab('actividades')}
        >
          Actividades
        </button>
        <button
          className={`nav-tab ${activeTab === 'ejecutar' ? 'active' : ''}`}
          onClick={() => setActiveTab('ejecutar')}
        >
          Ejecutar
        </button>
        <button
          className={`nav-tab ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial
        </button>
      </div>

      {activeTab === 'etiquetas' ? (
        <GestionEtiquetas />
      ) : activeTab === 'actividades' ? (
        <GestionActividades />
      ) : activeTab === 'ejecutar' ? (
        <EjecutarRutina />
      ) : (
        <Historial />
      )}
    </div>
  )
}