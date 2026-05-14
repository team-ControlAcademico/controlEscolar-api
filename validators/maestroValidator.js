const { body } = require('express-validator');

exports.createRules = [
  body('user_id').isInt().withMessage('El user_id debe ser un entero.'),
  body('num_empleado').notEmpty().withMessage('El numero de empleado es requerido.'),
  body('nombre').notEmpty().withMessage('El nombre es requerido.'),
  body('apellido_paterno').notEmpty().withMessage('El apellido paterno es requerido.'),
  body('email').optional().isEmail().withMessage('El email debe ser valido.'),
];

exports.updateRules = [
  body('num_empleado').optional().notEmpty().withMessage('El numero de empleado no puede estar vacio.'),
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacio.'),
  body('apellido_paterno').optional().notEmpty().withMessage('El apellido paterno no puede estar vacio.'),
  body('email').optional().isEmail().withMessage('El email debe ser valido.'),
];
