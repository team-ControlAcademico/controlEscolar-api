const express = require('express');
const router = express.Router();
const controller = require('../controllers/alumnoController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../validators');
const { createRules, updateRules } = require('../validators/alumnoValidator');

router.use(authenticate);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:alumnoId/calificaciones', controller.porAlumno);
router.post('/', authorize('admin', 'maestro'), createRules, validate, controller.store);
router.put('/:id', authorize('admin', 'maestro'), updateRules, validate, controller.update);
router.delete('/:id', authorize('admin'), controller.destroy);

module.exports = router;
