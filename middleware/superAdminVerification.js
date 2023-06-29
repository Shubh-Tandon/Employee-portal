var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const Employee = require('../models/Employee')
const {superAdminAuth} = require('../reusable/messages')

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const superAdminVerification = async (req, res, next) => {
    //Get the employee from the jwt token and add id to req object
    const token = req.header('auth-token');
    console.log("superAdmin",token)
    if (!token) {
        res.status(401).send({error : "Please authenticate using a valid token"});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log("superAdmin",data.employee.id)

        let superAdmin = await Employee.findById(data.employee.id);
        if (!superAdmin) {
            return res.status(404).send(notFoundError);
        }
        if ((superAdmin.role).toLowerCase() !== "superadmin") {
            console.log("i m here ")
            return res.status(401).send(superAdminAuth);
            console.log("i m here 2")

        }
        next();
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"})
        
    }
}

module.exports = superAdminVerification;