const { body } = require('express-validator');

exports.createRules = [
  body('materia_id').isInt().withMessage('El materia_id debe ser un entero.'),
  body('maestro_id').isInt().withMessage('El maestro_id debe ser un entero.'),
  body('grupo_id').isInt().withMessage('El grupo_id debe ser un entero.'),
  body('dia_semana').isIn(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']).withMessage('El dia de la semana no es valido.'),
  body('hora_inicio').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora de inicio debe ser formato HH:MM.'),
  body('hora_fin').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora de fin debe ser formato HH:MM.'),
];

exports.updateRules = [
  body('materia_id').optional().isInt().withMessage('El materia_id debe ser un entero.'),
  body('maestro_id').optional().isInt().withMessage('El maestro_id debe ser un entero.'),
  body('grupo_id').optional().isInt().withMessage('El grupo_id debe ser un entero.'),
  body('dia_semana').optional().isIn(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']).withMessage('El dia de la semana no es valido.'),
  body('hora_inicio').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora de inicio debe ser formato HH:MM.'),
  body('hora_fin').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora de fin debe ser formato HH:MM.'),
];
