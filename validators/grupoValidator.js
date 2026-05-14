const { body } = require('express-validator');

exports.createRules = [
  body('nombre').notEmpty().withMessage('El nombre es requerido.'),
  body('grado').isInt({ min: 1, max: 12 }).withMessage('El grado debe ser entre 1 y 12.'),
  body('seccion').notEmpty().withMessage('La seccion es requerida.'),
  body('capacidad').optional().isInt({ min: 1, max: 60 }).withMessage('La capacidad debe ser entre 1 y 60.'),
];

exports.updateRules = [
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacio.'),
  body('grado').optional().isInt({ min: 1, max: 12 }).withMessage('El grado debe ser entre 1 y 12.'),
  body('seccion').optional().notEmpty().withMessage('La seccion no puede estar vacia.'),
  body('capacidad').optional().isInt({ min: 1, max: 60 }).withMessage('La capacidad debe ser entre 1 y 60.'),
];
