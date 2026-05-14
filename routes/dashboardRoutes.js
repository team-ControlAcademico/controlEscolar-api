const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', controller.stats);
router.get('/asistencia-hoy', controller.asistenciaHoy);
router.get('/promedio-calificaciones', controller.promedioCalificaciones);

module.exports = router;
