const dotenv = require("dotenv");
const Employee = require('../models/Employee')

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const superAdminVerification = async (req, res, next) => {
    //Get the employee from the jwt token and add id to req object

    console.log("req", req.params.id)
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error : "Please authenticate using a valid token"});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        let TokenEmp = await Employee.findById(data.employee.id);
        // console.log("token emp", TokenEmp.id)
            if (!TokenEmp) {
            return res.status(404).send(notFoundError);
        }
    
 if (((TokenEmp.role).toLowerCase() !== "superadmin") && (req.params.id !== TokenEmp.id)) {
            console.log("i m here, both false not permitted ")
            return res.status(401).send("Not permitted");
        }
        req.employee = req.params.id;
       
        next();
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"})
        
    }
}

module.exports = superAdminVerification;