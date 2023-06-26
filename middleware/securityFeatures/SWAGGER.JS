const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Employee API',
        version: '1.0.0',
        description: 'API documentation for Employee',
      },
    },
    apis: ['../routes/auth.js'], 
  };
  
 export const specs = swaggerJsdoc(swaggerOptions);
  