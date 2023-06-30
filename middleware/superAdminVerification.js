var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const Employee = require('../models/Employee')
const { superAdminAuth, authenticationError } = require('../reusable/messages')

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const superAdminVerification = async (req, res, next) => {
    //Get the employee from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: authenticationError });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);

        let superAdmin = await Employee.findById(data.employee.id);
        if (!superAdmin) {
            return res.status(404).send(notFoundError);
        }
        if ((superAdmin.role).toLowerCase() !== "superadmin") {
            return res.status(401).send(superAdminAuth);
        }
        next();
    } catch (error) {
        res.status(401).send({ error: authenticationError })

    }
}

module.exports = superAdminVerification;