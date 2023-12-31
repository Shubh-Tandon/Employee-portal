const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  lastSalary: {
    type: Number,
  },
  emergencyNumber: {
    type: Number,
    required: true,
  },
  emergencyContactName: {
    type: String,
    required: true,
  },
  relationWithEmergencyContact: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model("employee", EmployeeSchema);
module.exports = Employee;