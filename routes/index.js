const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

router.get('/stats', authenticate, dashboardController.stats);
router.get('/actividad', authenticate, dashboardController.actividad);

router.use('/auth', require('./authRoutes'));
router.use('/alumnos', require('./alumnoRoutes'));
router.use('/maestros', require('./maestroRoutes'));
router.use('/grupos', require('./grupoRoutes'));
router.use('/materias', require('./materiaRoutes'));
router.use('/calificaciones', require('./calificacionRoutes'));
router.use('/asistencias', require('./asistenciaRoutes'));
router.use('/horarios', require('./horarioRoutes'));
router.use('/padres', require('./padreRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/ciclos', require('./cicloRoutes'));
router.use('/grados', require('./gradoRoutes'));
router.use('/turnos', require('./turnoRoutes'));
router.use('/auditoria', require('./auditoriaRoutes'));

module.exports = router;
