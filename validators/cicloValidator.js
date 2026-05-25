const { body } = require('express-validator');

const validateRange = body('fecha_fin').custom((value, { req }) => {
  if (!value || !req.body.fecha_inicio) return true;
  if (new Date(value) <= new Date(req.body.fecha_inicio)) {
    throw new Error('La fecha fin debe ser posterior a la fecha de inicio.');
  }
  return true;
});

exports.createRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres.'),
  body('fecha_inicio').notEmpty().withMessage('La fecha de inicio es requerida.')
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha valida.'),
  body('fecha_fin').notEmpty().withMessage('La fecha fin es requerida.')
    .isISO8601().withMessage('La fecha fin debe ser una fecha valida.'),
  validateRange,
  body('activo').optional().isBoolean().withMessage('Activo debe ser booleano.'),
];

exports.updateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacio.')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres.'),
  body('fecha_inicio').optional().isISO8601().withMessage('La fecha de inicio debe ser valida.'),
  body('fecha_fin').optional().isISO8601().withMessage('La fecha fin debe ser valida.'),
  validateRange,
  body('activo').optional().isBoolean().withMessage('Activo debe ser booleano.'),
];
