import { useState } from 'react'
import GestionEtiquetas from './pages/GestionEtiquetas'
import GestionActividades from './pages/GestionActividades'

export default function App() {
  const [activeTab, setActiveTab] = useState<'etiquetas' | 'actividades'>('etiquetas')

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>RutinaPersonal V1</h1>
        <p>Gestiona tus etiquetas y actividades</p>
      </div>

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
      </div>

      {activeTab === 'etiquetas' ? <GestionEtiquetas /> : <GestionActividades />}
    </div>
  )
}