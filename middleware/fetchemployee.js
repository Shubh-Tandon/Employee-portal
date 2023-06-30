var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


const fetchemployee =  (req, res, next) => {
    //Get the employee from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error : "Please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.employee = data.employee;
        next();
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"})
        
    }
}

module.exports = fetchemployee;