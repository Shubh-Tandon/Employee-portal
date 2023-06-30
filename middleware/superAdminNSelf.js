const dotenv = require("dotenv");
const Employee = require('../models/Employee')
var jwt = require('jsonwebtoken');
const { notFoundError, authenticationError, notAllowedError } = require('../reusable/messages')
dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const superAdminNSelf = async (req, res, next) => {
    //Get the employee from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: authenticationError});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        let tokenEmp = await Employee.findById(data.employee.id);
        if (!tokenEmp) {
            return res.status(404).send(notFoundError);
        }

        if (((tokenEmp.role).toLowerCase() !== "superadmin") && (req.params.id !== tokenEmp.id)) {
            return res.status(401).send(notAllowedError);
        }
        req.employee = req.params.id;

        next();
    } catch (error) {
        res.status(401).send({ error: authenticationError})

    }
}

module.exports = superAdminNSelf;