const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./db/index.js');

const app = express();
const PORT = 3001;

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Inicializar base de datos
initDb();

// Rutas de API
const etiquetasRouter = require('./routes/etiquetas');
app.use('/api/etiquetas', etiquetasRouter);

const actividadesRouter = require('./routes/actividades');
app.use('/api/actividades', actividadesRouter);

const historialRouter = require('./routes/historial');
app.use('/api/historial', historialRouter);

// Endpoint de salud
app.get('/api/health', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('initialized');
    res.json({
      status: 'ok',
      db: 'connected',
      initialized: row ? true : false
    });
  } catch (error) {
    console.error('Error checking database:', error);
    res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});