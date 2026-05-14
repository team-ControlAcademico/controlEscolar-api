const { body } = require('express-validator');

exports.createRules = [
  body('alumno_id').isInt().withMessage('El alumno_id debe ser un entero.'),
  body('fecha').isISO8601().withMessage('La fecha debe ser valida.'),
  body('estado').isIn(['presente', 'ausente', 'justificado', 'retardo']).withMessage('El estado debe ser presente, ausente, justificado o retardo.'),
];

exports.updateRules = [
  body('estado').optional().isIn(['presente', 'ausente', 'justificado', 'retardo']).withMessage('El estado debe ser presente, ausente, justificado o retardo.'),
];

exports.bulkRules = [
  body('fecha').isISO8601().withMessage('La fecha debe ser valida.'),
  body('registros').isArray({ min: 1 }).withMessage('Debe haber al menos un registro.'),
  body('registros.*.alumno_id').isInt().withMessage('El alumno_id debe ser un entero.'),
  body('registros.*.estado').isIn(['presente', 'ausente', 'justificado', 'retardo']).withMessage('El estado debe ser presente, ausente, justificado o retardo.'),
];
