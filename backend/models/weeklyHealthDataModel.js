// models/weeklyHealthDataModel.js
const mongoose = require('mongoose');

const weeklyHealthDataSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  pregnancyWeek: { type: Number, required: true },
  bloodPressure: String,
  bodyTemperature: Number,
  weight: Number,
  heartRate: Number,
  bloodSugar: Number,
  fetalHeartRate: Number,
  symptoms: String,
  comments: String,
  dataStatus: { type: String, default: 'Pending' },
});

module.exports = mongoose.model('WeeklyHealthData', weeklyHealthDataSchema);
