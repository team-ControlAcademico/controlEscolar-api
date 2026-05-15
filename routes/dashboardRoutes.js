const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', dashboardController.stats);
router.get('/actividad', dashboardController.actividad);
router.get('/asistencia-hoy', dashboardController.asistenciaHoy);
router.get('/promedio-calificaciones', dashboardController.promedioCalificaciones);

module.exports = router;
