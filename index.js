const express = require('express')
const connectToMongo = require('./database/db')
const dotenv = require("dotenv");
const { internalServerError, notAllowedError, emailValidation, nameValidation, passwordValidation, blankPasswordValidation, loginCredentialsValidation, notFoundError, employeeExistValidation, employeeDeleted } = require('./reusable/messages')
const Employee = require('./models/Employee');
const fetchemployee = require('./middleware/fetchemployee');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

dotenv.config({ path: '../config.env' });

const JWT_SECRET = process.env.JWT_SECRET_KEY


var app = express()

var cors = require('cors')

app.use(cors())


connectToMongo();

dotenv.config({ path: './config.env' });

const port = process.env.port;

app.use(express.json());

//Available Routes

// app.use('/auth', require('./routes/auth'))
// app.use('/', require('./routes/auth'))


const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node Api project',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3500/'
      }
    ],
    "components": {
      "securitySchemes": {
        // "BasicAuth": {
        //   "type": "http",
        //   "scheme": "basic"
        // }
        "Bearer": {
          "type": "http",
          "description": "Enter JWT token to continue",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },

  apis: ['./index.js']
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// /** 
// * @swagger 
// * /allemployees: 
//     components:
//       securitySchemes:
//         ApiToken:
//           type: apiKey
//           in: header
//           name: Authorization
//         apiKey:
//           type: apikey
//           in: header
//           name: apikey
//     paths:
// *     get: 
//         security:
//           ApiToken: []
//           ApiKey: []
//   *     description: Get all Employee 
//   *     responses:  
//   *       200: 
//   *         description: Success  
// *   
// */ 
/**
 * @swagger
 * /allemployees:
 *   get:
 *     security:
 *       - ApiKeyAuth: []
 *     description: Get all Employees
 *     responses:
 *       200:
 *         description: Success
 */

//Route 3:  Get all employees using: GET "/auth/allemployees", Require Auth ---Login required

// router.get('/allemployees', fetchemployee, limiter, async (req, res) => {
app.get('/allemployees', fetchemployee, async (req, res) => {
  try {
    const employees = await Employee.find({}).select("-password");
    res.json(employees);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(internalServerError)
  }
});



/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create an Employee
 *     description: Create an Employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Employee object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *                 unique: true
 *               password:
 *                 type: string
 *                 required: true
 *               phone:
 *                 type: string
 *                 required: true
 *               photo:
 *                 type: string
 *                 required: true
 *               address:
 *                 type: string
 *                 required: true
 *               fatherName:
 *                 type: string
 *                 required: true
 *               experience:
 *                 type: number
 *                 required: true
 *               lastSalary:
 *                 type: string
 *               emergencyNumber:
 *                 type: string
 *                 required: true
 *               emergencyContactName:
 *                 type: string
 *                 required: true
 *               relationWithEmergencyContact:
 *                 type: string
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date-time
 *                 default: Date.now
 *     responses:
 *       201:
 *         description: Created
 */


// Route 1: Create an employee/admin using POST "/auth/create", Require Auth --- Login required
app.post(
  '/create', fetchemployee,
  [
    body('name', nameValidation).isLength({ min: 3 }),
    body('email', emailValidation).isEmail(),
    body('password', passwordValidation).isLength({ min: 5 }),
  ],
  async (req, res) => {
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
  }
);


//     /** 
// * @swagger 
// * /Employees: 
// *   post: 
// *     description: Login an Employee 
//     schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 required: true
//  *                 unique: true
//  *               password:
//  *                 type: string
//  *                 required: true
// *     responses:  
// *       201: 
// *         description: Success  
// *   
// */  

/**
 * @swagger
 * /login:
 *   post:
 *     description: Login an Employee
 *     requestBody:
 *       description: Employee credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               email:
 *                 type: string
 *                 required: true
 *                 unique: true
 *               phone:
 *                 type: string
 *                 required: true
 *               photo:
 *                 type: string
 *                 required: true
 *               address:
 *                 type: string
 *                 required: true
 *               fatherName:
 *                 type: string
 *                 required: true
 *               experience:
 *                 type: number
 *                 required: true
 *               lastSalary:
 *                 type: string
 *               emergencyNumber:
 *                 type: string
 *                 required: true
 *               emergencyContactName:
 *                 type: string
 *                 required: true
 *               relationWithEmergencyContact:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Success
 */




//Route 2:  Login an employee/admin using: POST "/auth/login", Doesn't Require Auth ---No Login required

app.post('/login', [
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
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send(internalServerError)
  }

})

/**
 * @swagger
 * /deletemployee/{id}:
 *   delete:
 *     description: Delete an Employee
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Success
 */

// Route 4: Delete employee using DELETE "/auth/deletemployee/:id", Require Auth ---Login required
app.delete('/deletemployee/:id', async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).send(notFoundError);
    }

    // Allow deletion only if employee himself wants to delete

    // if (employee.id !== req.employee.id) {
    //     return res.status(401).send(notAllowedError)
    // }
    employee = await Employee.findByIdAndDelete(req.params.id)
    res.json({ "Success": employeeDeleted, employee: employee });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(internalServerError)
  }
});



/**
 * @swagger
 * /updateemployee/{id}:
 *   put:
 *     description: Update an Employee
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Success
 */


//Route 5: Update and employee using: PUT "/auth/updateemployee/:id", Require Auth ---Login required

app.put('/updateemployee/:id', async (req, res) => {
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
 * /employee/{id}:
 *   get:
 *     description: Get an Employee
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Success
 */

// Route 6: Get a single employee using id: GET "/employee/:id", Require Auth ---Login required
app.get('/employee/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).send(notFoundError);
    }
    res.status(200).send(employee);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(internalServerError);
  }
});



app.listen(port, () => {
  console.log(`Employee backend listening at http://localhost:${port}`)
})