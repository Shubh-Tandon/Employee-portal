const express = require('express')
const connectToMongo = require('./database/db')
const dotenv = require("dotenv");

var app = express()

var cors = require('cors')

app.use(cors())


connectToMongo();

dotenv.config({ path : './config.env'});

const port = process.env.port;

app.use(express.json());

//Available Routes
// Serve Swagger UI

app.use('/auth', require('./routes/auth'))

app.listen(port, () => {
  console.log(`Employee backend listening at http://localhost:${port}`)
})