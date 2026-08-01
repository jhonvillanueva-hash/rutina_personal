const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

// Rutas para historial de rutinas
router.post('/', historialController.crear);

module.exports = router;
