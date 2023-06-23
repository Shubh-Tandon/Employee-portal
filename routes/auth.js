const express = require('express')
const Employee = require('../models/Employee')
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const fetchemployee = require('../middleware/fetchEmployee');
// const {internalServerError , notAllowedError} from '.'

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY

const router = express.Router();


//Route 1:  create an employee/admin using: POST "/api/auth/create",Doesn't Require Auth ---No Login required

router.post('/create', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password must be of atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {
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
            return res.status(400).json({ success, error: "Employee with this email already exist" })
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
        res.json({ success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal 01 Server error occured")
    }
})


//Route 2:  Login an employee/admin using: POST "/api/auth/login", Doesn't Require Auth ---No Login required

router.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "password cannot be blank").exists(),
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
            return res.status(400).json({ error: "Please try to login with corrrect credentials " });
        }

        const passwordCompare = await bcrypt.compare(password, employee.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with corrrect credentials ss" });
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
        res.status(500).send("Internal 01 Server error occured")
    }

})

//Route 3:  Get all employees using: GET "/api/auth/allemployees", Require Auth ---Login required

router.get('/allemployees', fetchemployee, async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.json(employees);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error occured")
    }
})


//Route 4:  Delete employee using: DELETE "/api/auth/allemployees", Require Auth ---Login required

router.delete('/deletemployee/:id', fetchemployee, async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).send("Not Found");
        }

        //Allow deletion only if employee himself want to delete

        if (employee.id !== req.employee.id) {
            return res.status(401).send("Not Allowed")
        }
        employee = await Employee.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Employee has been deleted ", employee: employee });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error occured")
    }

})

//Route 5: Update and employee using: PUT "/api/auth/updateemployee/:id", Require Auth ---Login required

router.put('/updateemployee/:id', fetchemployee, async (req, res) => {
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
        if (!employee) { return res.status(404).send("Not Found") }

        employee = await Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, { new: true })
        res.json(employee);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error occured")
    }
})

//Route 6: Get the single employee using id: GET "/api/auth/employee/:id", Require Auth ---Login required

router.get('/employee/:id', fetchemployee, async (req,res) => {
    try {
        const employee = await Employee.findById(req.params.id).select("-password"); 
        if(! employee) {
         return res.status(404).send("Employee Not Found") 
        }
        res.status(200).send(employee);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error occured")
    }
})

module.exports = router;
