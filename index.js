const express = require('express')
const connectToMongo = require('./database/db')
const dotenv = require("dotenv");

const swaggerDoc = require('swagger-jsdoc');  
const swaggerUi = require('swagger-ui-express');   

var app = express()

var cors = require('cors')

app.use(cors())


connectToMongo();

//Swagger api config
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Portal",
      description: "Use of swagger in Employee Portal"
    },
    servers: [
      {
        url: "http://localhost:3500"
      },
    ],
  },
  apis: ["./routes/auth.js"],
};

const spec = swaggerDoc(options);

dotenv.config({ path : './config.env'});

const port = process.env.port;

app.use(express.json());

//Available Routes

app.use('/auth', require('./routes/auth'))

// homeroute root
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(spec));



app.listen(port, () => {
  console.log(`Employee backend listening at http://localhost:${port}`)
})