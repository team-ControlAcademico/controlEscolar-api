const express = require('express');
const router = express.Router();
const controller = require('../controllers/turnoController');
const authenticate = require('../middleware/auth');
const validate = require('../validators');
const { createRules, updateRules } = require('../validators/turnoValidator');

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Catalogo de turnos escolares
 */

router.use(authenticate);

/**
 * @swagger
 * /api/turnos:
 *   get:
 *     summary: Lista turnos
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista paginada }
 */
router.get('/', controller.index);

/**
 * @swagger
 * /api/turnos:
 *   post:
 *     summary: Crea un turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, hora_inicio, hora_fin]
 *             properties:
 *               nombre: { type: string, example: "Matutino" }
 *               hora_inicio: { type: string, example: "07:00" }
 *               hora_fin: { type: string, example: "13:00" }
 *     responses:
 *       201: { description: Creado }
 *       422: { description: Validacion }
 */
router.post('/', createRules, validate, controller.store);

/**
 * @swagger
 * /api/turnos/{id}:
 *   get:
 *     summary: Obtiene un turno por ID
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get('/:id', controller.show);

/**
 * @swagger
 * /api/turnos/{id}:
 *   put:
 *     summary: Actualiza un turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.put('/:id', updateRules, validate, controller.update);

/**
 * @swagger
 * /api/turnos/{id}:
 *   delete:
 *     summary: Elimina un turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Eliminado }
 *       404: { description: No encontrado }
 *       409: { description: Tiene dependencias }
 */
router.delete('/:id', controller.destroy);

module.exports = router;
