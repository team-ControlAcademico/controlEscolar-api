const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditoriaController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auditoria
 *   description: Consulta de logs de auditoria
 */

router.use(authenticate);

/**
 * @swagger
 * /api/auditoria:
 *   get:
 *     summary: Lista logs de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tabla
 *         schema: { type: string }
 *       - in: query
 *         name: accion
 *         schema: { type: string, enum: [INSERT, UPDATE, DELETE] }
 *       - in: query
 *         name: usuario_id
 *         schema: { type: integer }
 *       - in: query
 *         name: registro_id
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista paginada de logs }
 */
router.get('/', controller.index);

module.exports = router;
