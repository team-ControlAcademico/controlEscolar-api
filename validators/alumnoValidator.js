const { body } = require('express-validator');

exports.createRules = [
  body('user_id').isInt().withMessage('El user_id debe ser un entero.'),
  body('matricula').notEmpty().withMessage('La matricula es requerida.'),
  body('nombre').notEmpty().withMessage('El nombre es requerido.'),
  body('apellido_paterno').notEmpty().withMessage('El apellido paterno es requerido.'),
  body('grupo_id').optional().isInt().withMessage('El grupo_id debe ser un entero.'),
  body('padre_id').optional().isInt().withMessage('El padre_id debe ser un entero.'),
  body('genero').optional().isIn(['M', 'F', 'Otro']).withMessage('El genero debe ser M, F o Otro.'),
  body('email').optional().isEmail().withMessage('El email debe ser valido.'),
];

exports.updateRules = [
  body('matricula').optional().notEmpty().withMessage('La matricula no puede estar vacia.'),
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacio.'),
  body('apellido_paterno').optional().notEmpty().withMessage('El apellido paterno no puede estar vacio.'),
  body('grupo_id').optional({ nullable: true }).isInt().withMessage('El grupo_id debe ser un entero.'),
  body('padre_id').optional({ nullable: true }).isInt().withMessage('El padre_id debe ser un entero.'),
  body('genero').optional().isIn(['M', 'F', 'Otro']).withMessage('El genero debe ser M, F o Otro.'),
  body('email').optional().isEmail().withMessage('El email debe ser valido.'),
];
