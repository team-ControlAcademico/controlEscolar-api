const { body } = require('express-validator');

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const validateTimeRange = body('hora_fin').custom((value, { req }) => {
  if (!value || !req.body.hora_inicio) return true;
  if (value <= req.body.hora_inicio) {
    throw new Error('La hora fin debe ser posterior a la hora inicio.');
  }
  return true;
});

exports.createRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres.'),
  body('hora_inicio').notEmpty().withMessage('La hora de inicio es requerida.')
    .matches(timeRegex).withMessage('La hora de inicio debe tener formato HH:MM o HH:MM:SS.'),
  body('hora_fin').notEmpty().withMessage('La hora fin es requerida.')
    .matches(timeRegex).withMessage('La hora fin debe tener formato HH:MM o HH:MM:SS.'),
  validateTimeRange,
];

exports.updateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacio.')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres.'),
  body('hora_inicio').optional().matches(timeRegex).withMessage('La hora de inicio debe tener formato HH:MM o HH:MM:SS.'),
  body('hora_fin').optional().matches(timeRegex).withMessage('La hora fin debe tener formato HH:MM o HH:MM:SS.'),
  validateTimeRange,
];
