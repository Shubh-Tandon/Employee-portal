const dotenv = require("dotenv");
const Employee = require('../models/Employee')
var jwt = require('jsonwebtoken');

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const superAdminNSelf = async (req, res, next) => {
    //Get the employee from the jwt token and add id to req object

    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error : "Please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        let TokenEmp = await Employee.findById(data.employee.id);
            if (!TokenEmp) {
            return res.status(404).send(notFoundError);
        }
    
 if (((TokenEmp.role).toLowerCase() !== "superadmin") && (req.params.id !== TokenEmp.id)) {
            return res.status(401).send("Not permitted");
        }
        req.employee = req.params.id;
       
        next();
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"})
        
    }
}

module.exports = superAdminNSelf;