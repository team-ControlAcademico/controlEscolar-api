const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Control Escolar',
      version: '1.0.0',
      description: 'Documentación de la API del sistema de control escolar',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/index.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };