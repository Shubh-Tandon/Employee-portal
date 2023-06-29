const express = require('express')
const Employee = require('../models/Employee')
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const fetchemployee = require('../middleware/fetchEmployee');
const { internalServerError, notAllowedError, emailValidation, nameValidation, passwordValidation, blankPasswordValidation, loginCredentialsValidation, notFoundError, employeeExistValidation, employeeDeleted, superAdminAuth } = require('../reusable/messages')
const rateLimit = require('express-rate-limit');
const limiter = require('../middleware/securityFeatures/rateLimiting');
const helmet = require('helmet');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const superAdminVerification = require('../middleware/superAdminVerification');

const router = express.Router();


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
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *         - phone
 *         - photo
 *         - address
 *         - fatherName
 *         - experience
 *         - lastSalary
 *       properties:
 *         name:
 *           type: string
 *           description: Employee Name
 *         email:
 *           type: string
 *           description: Employee Email
 *         password:
 *           type: string
 *           description: Employee password
 *         role:
 *           type: string
 *           description: Employee role
 *         phone:
 *           type: number
 *           description: Employee phone number
 *         photo:
 *           type: string
 *           description: Employee photo
 *         address:
 *           type: string
 *           description: Employee address
 *         fatherName:
 *           type: string
 *           description: Employee Father Name
 *         experience:
 *           type: number
 *           description: Employee Experience
 *         lastSalary:
 *           type: number
 *           description: Employee Salary
 *         emergencyNumber:
 *           type: number
 *           description: Employee Emergency Number
 *         emergencyContactName:
 *           type: string
 *           description: Employee Emergency contact name
 *         relationWithEmergencyContact:
 *           type: string
 *           description: Employee Emergency Contact Name
 */

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: authentication apis
 * 
 */



/**
 * @swagger
 * /auth/create:
 *   post:
 *     parameters:
 *       - name: auth-token
 *         in: header
 *         description: ''
 *         required: false
 *     summary: Creating an employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       '201':
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       '500':
 *         description: Internal server error
 */


//Route 1:  create an employee/admin using: POST "/auth/create", Require Auth --- Login required

router.post('/create', [
    body('name', nameValidation).isLength({ min: 3 }),
    body('email', emailValidation).isEmail(),
    body('password', passwordValidation).isLength({ min: 5 }),
], sanitizeInput, fetchemployee, limiter, async (req, res) => {
    let success = false;

    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    // check whether the user with this email exist already
    try {
        let superAdmin = await Employee.findById(req.employee.id);
        if (!superAdmin) {
            return res.status(404).send(notFoundError);
        }
        if ((superAdmin.role).toLowerCase() !== "superadmin") {
            return res.status(401).send(superAdminAuth);
        }
        let employee = await Employee.findOne({ email: req.body.email });
        if (employee) {
            return res.status(409).json({ success, error: employeeExistValidation })
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
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - photo
 *         - address
 *         - fatherName
 *         - experience
 *         - lastSalary
 *       properties:
 *         name:
 *           type: string
 *           description: Employee Name
 *         email:
 *           type: string
 *           description: Employee Email
 *         password:
 *           type: string
 *           description: Employee Password
 *         phone:
 *           type: string
 *           description: Employee Phone Number
 *         photo:
 *           type: string
 *           description: Employee Photo
 *         address:
 *           type: string
 *           description: Employee Address
 *         fatherName:
 *           type: string
 *           description: Employee Father Name
 *         experience:
 *           type: number
 *           description: Employee Experience
 *         lastSalary:
 *           type: string
 *           description: Employee Salary
 *         emergencyNumber:
 *           type: string
 *           description: Employee Emergency Number
 *         emergencyContactName:
 *           type: string
 *           description: Employee Emergency Contact Name
 *         relationWithEmergencyContact:
 *           type: string
 *           description: Employee Emergency Contact Name
 */



/**
 * @swagger
 * /auth/login:
 *  post:
 *    summary: login employee
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Employee'
 *    responses:
 *      '200':
 *        description: Employee login successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Employee'
 *      '500':
 *        description: Internal server error
 */


//Route 2:  Login an employee/admin using: POST "/auth/login", Doesn't Require Auth ---No Login required

router.post('/login', [
    body('email', emailValidation).isEmail(),
    body('password', blankPasswordValidation).exists(),
], sanitizeInput, limiter, async (req, res) => {
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
            return res.status(400).json({ error: loginCredentialsValidation });

        }

        const passwordCompare = await bcrypt.compare(password, employee.password);
        if (!passwordCompare) {
            success = false;
            return res.status(401).json({ success, error: loginCredentialsValidation });
        }

        const data = {
            employee: {
                id: employee.id
            }
        }
        //generate token
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({ success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)

    }

})
/**
 * @swagger
 * /auth/allemployees:
 *   get:
 *     summary: Fetch all employees
 *     tags: [Auth]
 *     parameters:
 *       - name: auth-token
 *         in: header
 *         description: ''
 *         required: false
 *     responses:
 *       '200':
 *         description: Employees loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       '500':
 *         description: Internal server error
 */

//Route 3:  Get all employees using: GET "/auth/allemployees", Require Auth ---Login required

router.get('/allemployees', limiter, fetchemployee, async (req, res) => {
    // router.get('/allemployees', limiter, superAdminVerification ,async (req, res) => {
    try {
        let superAdmin = await Employee.findById(req.employee.id);
        if (!superAdmin) {
            return res.status(404).send(notFoundError);
        }
        if ((superAdmin.role).toLowerCase() !== "superadmin") {
            return res.status(401).send(superAdminAuth);
        }
        const employees = await Employee.find({}).select("-password");
        res.status(200).json(employees);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }
})


/**
 * @swagger
 * /auth/deletemployee/{id}:
 *   delete:
 *     parameters:
 *       - name: auth-token
 *         in: header
 *         description: ''
 *         required: true
 *       - name: id
 *         in: path
 *         required: true
 *     summary: Delete employee
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       '500':
 *         description: Internal server error
 */



//Route 4:  Delete employee using: DELETE "/auth/deletemployee/:id", Require Auth ---Login required

router.delete('/deletemployee/:id', limiter, fetchemployee, async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).send(notFoundError);
        }
        let superAdmin = await Employee.findById(req.employee.id);

        // Allow deletion only if employee or superadmim himself wantsss to delete
        if ((employee.id !== req.employee.id) && ((superAdmin.role).toLowerCase() !== "superadmin")) {
            return res.status(401).send(notAllowedError)
        }

        employee = await Employee.findByIdAndDelete(req.params.id)
        res.status(200).json({ "Success": employeeDeleted, employee: employee });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }

})


/**
 * @swagger
 * /auth/updateemployee/{id}:
 *   put:
 *     parameters:
 *       - name: auth-token
 *         in: header
 *         description: ''
 *         required: true
 *       - name: id
 *         in: path
 *         required: true
 *     summary: Update employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       '202':
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       '500':
 *         description: Internal server error
 */


//Route 5: Update and employee using: PUT "/auth/updateemployee/:id", Require Auth ---Login required

router.put('/updateemployee/:id', sanitizeInput, limiter, fetchemployee, async (req, res) => {



    const { name, email, phone, photo, address, fatherName, experience, lastSalary, emergencyNumber, emergencyContactName, relationWithEmergencyContact } = req.body;

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
        // if (!employee) { return res.status(404).send(notFoundError) }


        let superAdmin = await Employee.findById(req.employee.id);

        // Allow updation only if employee or super admin himself want to update

        if ((employee.id !== req.employee.id) && ((superAdmin.role).toLowerCase() !== "superadmin")) {
            return res.status(401).send(notAllowedError)
        }

        employee = await Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, { new: true })
        res.status(202).json(employee);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }
})


/**
 * @swagger
 * /auth/employee/{id}:
 *   get:
 *     parameters:
 *       - name: auth-token
 *         in: header
 *         description: ''
 *         required: true
 *       - name: id
 *         in: path
 *         required: true
 *     summary: Get an employee
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: Employee logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       '500':
 *         description: Internal server error
 */

//Route 6: Get the single employee using id: GET "/employee/:id", Require Auth ---Login required

router.get('/employee/:id', limiter, fetchemployee, async (req, res) => {
    try {
        let superAdmin = await Employee.findById(req.employee.id);
        if (!superAdmin) {
            return res.status(404).send(notFoundError);
        }
        if ((superAdmin.role).toLowerCase() !== "superadmin") {
            return res.status(401).send(superAdminAuth);
        }
        const employee = await Employee.findById(req.params.id).select("-password");
        if (!employee) {
            return res.status(404).send(notFoundError)
        }
        res.status(200).send(employee);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(internalServerError)
    }
})

module.exports = router;