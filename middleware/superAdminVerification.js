var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const Employee = require('../models/Employee')

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const superAdminVerification = async (req, res, next) => {
    //Get the employee from the jwt token and add id to req object
    const token = req.header('auth-token');
    // console.log(token)
    if (!token) {
        res.status(401).send({error : "Please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        const info =await Employee.findOne(data.id);
        console.log(info);
        req.employee = data.employee;
        next();
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"})
        
    }
}

module.exports = superAdminVerification;