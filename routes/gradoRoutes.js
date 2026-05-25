const express = require('express');
const router = express.Router();
const controller = require('../controllers/gradoController');
const authenticate = require('../middleware/auth');
const validate = require('../validators');
const { createRules, updateRules } = require('../validators/gradoValidator');

/**
 * @swagger
 * tags:
 *   name: Grados
 *   description: Catalogo de grados escolares
 */

router.use(authenticate);

/**
 * @swagger
 * /api/grados:
 *   get:
 *     summary: Lista grados
 *     tags: [Grados]
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
 *       - in: query
 *         name: nivel
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista paginada }
 */
router.get('/', controller.index);

/**
 * @swagger
 * /api/grados:
 *   post:
 *     summary: Crea un grado
 *     tags: [Grados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, nivel, orden]
 *             properties:
 *               nombre: { type: string, example: "1ro" }
 *               nivel: { type: string, example: "Primaria" }
 *               orden: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Creado }
 *       422: { description: Validacion }
 */
router.post('/', createRules, validate, controller.store);

/**
 * @swagger
 * /api/grados/{id}:
 *   get:
 *     summary: Obtiene un grado por ID
 *     tags: [Grados]
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
 * /api/grados/{id}:
 *   put:
 *     summary: Actualiza un grado
 *     tags: [Grados]
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
 * /api/grados/{id}:
 *   delete:
 *     summary: Elimina un grado
 *     tags: [Grados]
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
