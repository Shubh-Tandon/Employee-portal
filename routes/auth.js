const express = require('express');
const Employee = require('../models/Employee');

const app = express.Router();
const swaggerJSDoc = require('swagger-jsdoc');  
const swaggerUI = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node Api project',
            version: '1.0.0'
        },
        servers: [
            {
                url: 'http://localhost:3500/'
            }
        ]
    },
    apis: ['./auth.js']
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: This api is used to check swagger
 *     description: This api is used to check swagger description
 *     responses:
 *       200:
 *         description: To test GET method
 */
app.get('/', (req, res) => {
    res.send("Welcome to employee api");
});

module.exports = app;
