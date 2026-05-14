const express = require('express');
const router = express.Router();
const controller = require('../controllers/alumnoController');
const authenticate = require('../middleware/auth');
const validate = require('../validators');
const { createRules, updateRules } = require('../validators/alumnoValidator');

router.use(authenticate);

router.get('/', controller.index);
router.post('/', createRules, validate, controller.store);
router.get('/:id', controller.show);
router.put('/:id', updateRules, validate, controller.update);
router.delete('/:id', controller.destroy);
router.get('/:alumnoId/calificaciones', controller.porAlumno);

module.exports = router;
