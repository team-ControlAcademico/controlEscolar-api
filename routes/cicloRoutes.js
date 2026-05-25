const express = require('express');
const router = express.Router();
const controller = require('../controllers/cicloController');
const authenticate = require('../middleware/auth');
const validate = require('../validators');
const { createRules, updateRules } = require('../validators/cicloValidator');

/**
 * @swagger
 * tags:
 *   name: Ciclos
 *   description: Gestion de ciclos escolares
 */

router.use(authenticate);

/**
 * @swagger
 * /api/ciclos:
 *   get:
 *     summary: Lista ciclos escolares
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 15 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Lista paginada de ciclos }
 *       401: { description: No autenticado }
 */
router.get('/', controller.index);

/**
 * @swagger
 * /api/ciclos:
 *   post:
 *     summary: Crea un ciclo escolar
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, fecha_inicio, fecha_fin]
 *             properties:
 *               nombre: { type: string, example: "2025-2026" }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *               activo: { type: boolean }
 *     responses:
 *       201: { description: Ciclo creado }
 *       422: { description: Error de validacion }
 */
router.post('/', createRules, validate, controller.store);

/**
 * @swagger
 * /api/ciclos/{id}:
 *   get:
 *     summary: Obtiene un ciclo escolar por ID
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Ciclo encontrado }
 *       404: { description: No encontrado }
 */
router.get('/:id', controller.show);

/**
 * @swagger
 * /api/ciclos/{id}:
 *   put:
 *     summary: Actualiza un ciclo escolar
 *     tags: [Ciclos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: Ciclo actualizado }
 *       404: { description: No encontrado }
 *       422: { description: Error de validacion }
 */
router.put('/:id', updateRules, validate, controller.update);

/**
 * @swagger
 * /api/ciclos/{id}:
 *   delete:
 *     summary: Elimina un ciclo escolar
 *     tags: [Ciclos]
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
