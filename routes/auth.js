const express = require('express')
const Employee = require('../models/Employee')
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const fetchemployee = require('../middleware/fetchEmployee');
const {internalServerError, notAllowedError, emailValidation, nameValidation, passwordValidation, blankPasswordValidation, loginCredentialsValidation, notFoundError, employeeExistValidation, employeeDeleted} = require('../reusable/messages')
const rateLimit = require('express-rate-limit');
const limiter = require('../middleware/securityFeatures/rateLimiting');
const helmet = require('helmet');
const swaggerJSDoc = require('swagger-jsdoc');  
const swaggerUI = require('swagger-ui-express');   

const router = express.Router();


//Swagger Configuration  
const swaggerOptions = {  
    swaggerDefinition: {  
        info: {  
            title:'Employee API',  
            version:'1.0.0'  
        }  
    },  
    apis:['api.js'],  
}  
const swaggerDocs = swaggerJSDoc(swaggerOptions);
router.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));  



const sanitizeInput = [
    body('name').trim().escape(),
    body('email').trim().escape(),
    body('password').trim().escape(),
    // Add sanitization rules for other fields as needed
  ];


dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


router.use(helmet());


/** 
* @swagger 
* /Employees: 
*   Post: 
*     description: Create an Employee 
*     responses:  
*       201: 
*         description: Created  
*   
*/  

//Route 1:  create an employee/admin using: POST "/auth/create", Require Auth --- Login required

    router.post('/create',limiter,sanitizeInput, [
        body('name', nameValidation).isLength({ min: 3 }),
        body('email', emailValidation).isEmail(),
        body('password', passwordValidation).isLength({ min: 5 }),
    ],fetchemployee ,async (req, res) => {
        let success = false;

        // If there are errors, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        // check whether the user with this email exist already
        try {
            let employee = await Employee.findOne({ email: req.body.email });
            if (employee) {
                return res.status(409).json({ success, error: employeeExistValidation})
            }

            const salt = await bcrypt.genSalt(10);
            const securedPassword = await bcrypt.hash(req.body.password, salt);


            // create a new user
            employee = await Employee.create({
                name: req.body.name,
                email: req.body.email,
                password: securedPassword,
                phone: req.body.phone,
                photo: req.body.photo,
                role: req.body.role,
                address: req.body.photo,
                fatherName: req.body.fatherName,
                experience: req.body.experience,
                lastSalary: req.body.lastSalary,
                emergencyNumber: req.body.emergencyNumber,
                emergencyContactName: req.body.emergencyContactName,
                relationWithEmergencyContact: req.body.relationWithEmergencyContact,
            })
            const data = {
                employee: {
                    id: employee.id
                }
            }
            //generate token
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.status(201).json({ success, authtoken })

        } catch (error) {
            console.error(error.message);
            res.status(500).send(internalServerError)
        }
    })

    /** 
* @swagger 
* /Employees: 
*   post: 
*     description: Login an Employee 
*     responses:  
*       201: 
*         description: Success  
*   
*/  


//Route 2:  Login an employee/admin using: POST "/auth/login", Doesn't Require Auth ---No Login required

router.post('/login', limiter,sanitizeInput ,[
    body('email', emailValidation).isEmail(),
    body('password', blankPasswordValidation).exists(),
], async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        let employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(400).json({ error: loginCredentialsValidation});
        }

        const passwordCompare = await bcrypt.compare(password, employee.password);
        if (!passwordCompare) {
            success = false;
            return res.status(401).json({ success, error: loginCredentialsValidation});
        }

        const data = {
            employee: {
                id: employee.id
            }
        }
        //generate token
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }

})

/** 
* @swagger 
* /Employees: 
*   get: 
*     description: Get all Employee 
*     responses:  
*       200: 
*         description: Success  
*   
*/  


//Route 3:  Get all employees using: GET "/auth/allemployees", Require Auth ---Login required

// router.get('/allemployees', fetchemployee, limiter, async (req, res) => {
router.get('/allemployees', async (req, res) => {
    try {
        const employees = await Employee.find({}).select("-password"); 
        res.json(employees);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }
})

/** 
* @swagger 
* /Employees: 
*   delete: 
*     description: Delete an Employee 
*     responses:  
*       200: 
*         description: Success  
*   
*/  


//Route 4:  Delete employee using: DELETE "/auth/deletemployee/:id", Require Auth ---Login required

router.delete('/deletemployee/:id', fetchemployee,limiter, async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).send(notFoundError);
        }

        //Allow deletion only if employee himself want to delete

        if (employee.id !== req.employee.id) {
            return res.status(401).send(notAllowedError)
        }
        employee = await Employee.findByIdAndDelete(req.params.id)
        res.json({ "Success": employeeDeleted, employee: employee });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }

})


/** 
* @swagger 
* /Employees: 
*   put: 
*     description:  Update an Employee 
*     responses:  
*       202: 
*         description: Success  
*   
*/  


//Route 5: Update and employee using: PUT "/auth/updateemployee/:id", Require Auth ---Login required

router.put('/updateemployee/:id', fetchemployee,limiter,async (req, res) => {
    const {name, email, phone, photo, address, fatherName, experience, lastSalary, emergencyNumber, emergencyContactName, relationWithEmergencyContact } = req.body;
    
    try {
        // creating a new employee object
        const newEmployee = {};
        if (name) { newEmployee.name = name };
        if (email) { newEmployee.email = email };
        if (phone) { newEmployee.phone = phone };
        if (photo) { newEmployee.photo = photo };
        if (address) { newEmployee.address = address };
        if (fatherName) { newEmployee.fatherName = fatherName };
        if (experience) { newEmployee.experience = experience };
        if (lastSalary) { newEmployee.lastSalary = lastSalary };
        if (emergencyNumber) { newEmployee.emergencyNumber = emergencyNumber };
        if (emergencyContactName) { newEmployee.emergencyContactName = emergencyContactName };
        if (relationWithEmergencyContact) { newEmployee.relationWithEmergencyContact = relationWithEmergencyContact };
      

        //Find the employee to be updated and update it
        let employee = await Employee.findById(req.params.id);
        if (!employee) { return res.status(404).send(notFoundError) }

        employee = await Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, { new: true })
        res.status(202).json(employee);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }
})

/** 
* @swagger 
* /Employees: 
*   get: 
*     description: Get an Employee 
*     responses:  
*       200: 
*         description: Success  
*   
*/  


//Route 6: Get the single employee using id: GET "/employee/:id", Require Auth ---Login required

router.get('/employee/:id', fetchemployee, limiter, async (req,res) => {
    try {
        const employee = await Employee.findById(req.params.id).select("-password"); 
        if(! employee) {
         return res.status(404).send(notFoundError) 
        }
        res.status(200).send(employee);

    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }
})

module.exports = router;
