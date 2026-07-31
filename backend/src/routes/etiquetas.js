const express = require('express');
const router = express.Router();
const etiquetasController = require('../controllers/etiquetasController');

// Rutas para etiquetas
router.get('/', etiquetasController.listar);
router.post('/', etiquetasController.crear);
router.put('/:id', etiquetasController.actualizar);
router.delete('/:id', etiquetasController.eliminar);

module.exports = router;