const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Control Escolar API',
      version: '1.0.0',
      description: 'API REST para plataforma de Control Escolar (Ciclos, Grados, Turnos, Grupos, etc.)',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Ciclo: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            fecha_inicio: { type: 'string', format: 'date' },
            fecha_fin: { type: 'string', format: 'date' },
            activo: { type: 'boolean' },
          },
        },
        Grado: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            nivel: { type: 'string' },
            orden: { type: 'integer' },
          },
        },
        Turno: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            hora_inicio: { type: 'string', example: '07:00:00' },
            hora_fin: { type: 'string', example: '13:00:00' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '..', 'routes', '*.js'),
  ],
};

module.exports = swaggerJSDoc(options);
