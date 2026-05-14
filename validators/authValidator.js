const { body } = require('express-validator');

exports.registerRules = [
  body('name').notEmpty().withMessage('El nombre es requerido.'),
  body('email').isEmail().withMessage('El email debe ser valido.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('rol').isIn(['admin', 'maestro', 'alumno', 'padre']).withMessage('El rol debe ser admin, maestro, alumno o padre.'),
];

exports.loginRules = [
  body('email').isEmail().withMessage('El email debe ser valido.').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida.'),
];
