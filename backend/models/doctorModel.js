const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Create a new Mongoose schema for the doctor
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  availabilityStatus: { type: String, default: 'Active' },
  password: { 
    type: String, 
    required: true, 
    default: 'defaultPassword123',
  },
});


doctorSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next(); 
    } catch (error) {
      next(error); 
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
