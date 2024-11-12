const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const adminModel = require('../models/adminModel'); 
const doctorModel = require('../models/doctorModel')

//create Token function ------->

const createToken = (userId) => {
  return jwt.sign({ id: userId }, 'your_secret_key', { expiresIn: '1h' }); 
};

//admin login ------------------>

const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await adminModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = createToken(user._id);
    console.log(token);

    res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


//add doctors


const addDoc = async (req, res) => {
  
  const { name, specialization, phone, email, address, availabilityStatus } = req.body;

  try {
    const newDoctor = new doctorModel({
      name,
      specialization,
      phone,
      email,
      address,
      availabilityStatus,
    });

    // Save the new doctor to the database
    await newDoctor.save();

    // Return the saved doctor as response
    res.status(201).json({ message: 'Doctor added successfully', doctor: newDoctor });
  } catch (err) {
    res.status(500).json({ message: 'Error saving doctor', error: err.message });
  }
};

// fetch all doctors ------------------------>
const fetchDoc = async (req, res) => {
  try {
    const doctors = await doctorModel.find();
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors', error: err.message });
  }
};


//update doctor ------------------------------>
const updateDoc = async (req, res) => {
  console.log("hiii");
  try {
    const doctorId = req.params.id; 
    const updatedData = req.body;   

    const updatedDoctor = await doctorModel.findByIdAndUpdate(doctorId, updatedData, {
      new: true,  
      runValidators: true, 
    });

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Error updating doctor' });
  }
};


// Delete doctor by ID --------------------------->
const delDoc = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Find and delete the doctor by ID
    const deletedDoctor = await doctorModel.findByIdAndDelete(doctorId);

    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};

module.exports = { adminLogin, addDoc, fetchDoc, updateDoc, delDoc };
