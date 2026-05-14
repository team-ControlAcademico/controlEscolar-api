const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { swaggerUi, specs } = require('./config/swagger');
const { logger, morganMiddleware } = require('./middlewares/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica que el servidor está corriendo
 *     responses:
 *       200:
 *         description: Servidor OK
 */
app.get('/health', (req, res) => {
  logger.info('Health check solicitado');
  res.json({ status: 'OK', message: 'Backend corriendo correctamente' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`Documentación en http://localhost:${PORT}/api-docs`);
});