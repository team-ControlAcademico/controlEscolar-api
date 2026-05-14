const { body } = require('express-validator');

exports.createRules = [
  body('alumno_id').isInt().withMessage('El alumno_id debe ser un entero.'),
  body('materia_id').isInt().withMessage('El materia_id debe ser un entero.'),
  body('maestro_id').isInt().withMessage('El maestro_id debe ser un entero.'),
  body('parcial').isIn(['1', '2', '3', 'final']).withMessage('El parcial debe ser 1, 2, 3 o final.'),
  body('calificacion').isFloat({ min: 0, max: 10 }).withMessage('La calificacion debe ser entre 0 y 10.'),
];

exports.updateRules = [
  body('parcial').optional().isIn(['1', '2', '3', 'final']).withMessage('El parcial debe ser 1, 2, 3 o final.'),
  body('calificacion').optional().isFloat({ min: 0, max: 10 }).withMessage('La calificacion debe ser entre 0 y 10.'),
];
