const { body } = require('express-validator');

exports.createRules = [
  body('nombre').notEmpty().withMessage('El nombre es requerido.'),
  body('codigo').notEmpty().withMessage('El codigo es requerido.'),
  body('creditos').optional().isInt({ min: 1, max: 10 }).withMessage('Los creditos deben ser entre 1 y 10.'),
];

exports.updateRules = [
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacio.'),
  body('codigo').optional().notEmpty().withMessage('El codigo no puede estar vacio.'),
  body('creditos').optional().isInt({ min: 1, max: 10 }).withMessage('Los creditos deben ser entre 1 y 10.'),
];
