const express = require('express');
const router = express.Router();
const controller = require('../controllers/maestroController');
const authenticate = require('../middleware/auth');
const validate = require('../validators');
const { createRules, updateRules } = require('../validators/maestroValidator');

router.use(authenticate);

router.get('/', controller.index);
router.post('/', createRules, validate, controller.store);
router.get('/:id', controller.show);
router.put('/:id', updateRules, validate, controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
