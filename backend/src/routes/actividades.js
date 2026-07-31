const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');

// Rutas para actividades
router.get('/', actividadesController.listar);
router.post('/', actividadesController.crear);
router.put('/:id', actividadesController.actualizar);
router.delete('/:id', actividadesController.eliminar);

module.exports = router;