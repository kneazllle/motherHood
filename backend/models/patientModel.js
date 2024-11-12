const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  expectedDelivery: { type: Date, required: true },
  lifestyleDiseases: { type: [String], default: [] },
  checkupDates: { type: [Date], default: [] },
});



module.exports = mongoose.model('Patient', patientSchema);
