const mongoose = require('mongoose')
const {Schema} = mongoose;


const EmployeeSchema = new Schema({
     
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique: true
    },
    password : {
        type : String,
        required : true,
    },
    phone : {
        type : String,
        required : true
    },
    photo : {
        type : String,
        required : true
    },
    
  
    address : {
        type : String,
        required : true
    },
    fatherName : {
        type : String,
        required : true
    },
    experience : {
        type: Number,
        required: true
    },
    lastSalary : {
        type : String
    },
    emergencyNumber : {
        type : String,
        required : true
    }, 
    emergencyContactName : {
        type : String,
        required : true
    }, 
    relationWithEmergencyContact : {
        type : String,
        required : true
    }, 
    date : {
        type : Date,
        default : Date.now
    }
})

const Employee =  mongoose.model('employee', EmployeeSchema)
module.exports = Employee;