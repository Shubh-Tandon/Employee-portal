const dotenv = require("dotenv")
const mongoose = require('mongoose')

dotenv.config({ path : './config.env'});


const mongoURI = process.env.uri;
                                     

mongoose.set('strictQuery', true);

const connectToMongo = async () => {
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to Mongo Successfully');
    } catch (error) {
      console.error('Error connecting to Mongo:', error);
    }
  };


module.exports = connectToMongo;