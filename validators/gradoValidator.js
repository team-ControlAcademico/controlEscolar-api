const { body } = require('express-validator');

exports.createRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres.'),
  body('nivel').trim().notEmpty().withMessage('El nivel es requerido.')
    .isLength({ max: 50 }).withMessage('El nivel no puede exceder 50 caracteres.'),
  body('orden').isInt({ min: 1, max: 100 }).withMessage('El orden debe ser un entero positivo.'),
];

exports.updateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacio.')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres.'),
  body('nivel').optional().trim().notEmpty().withMessage('El nivel no puede estar vacio.')
    .isLength({ max: 50 }).withMessage('El nivel no puede exceder 50 caracteres.'),
  body('orden').optional().isInt({ min: 1, max: 100 }).withMessage('El orden debe ser un entero positivo.'),
];
