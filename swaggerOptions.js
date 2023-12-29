const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TenantApi',
      version: '1.0.0',
      description: 'Tenant Project',
    },
    servers: [
      {
        url: 'http://localhost:3000', 
        description: 'Tenant Project Server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
