const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const patientModel = require('../models/patientModel');
const chatModel = require('../models/chatModel');


const confirmappointment = async (req, res) => {
  try {

    const confirmId = req.body.appointmentId;
    console.log(confirmId)
    const appointment = await appointmentModel.findById(confirmId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    appointment.status = 'Confirmed';
    await appointment.save();
    res.status(200).json({ message: 'Appointment confirmed', appointment });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const saveChat = async (req, res) => {
  console.log("hiii");
  const { receiverId, message } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', ''); 
  const decoded = jwt.verify(token, '12345');  // Using jwt_secret from environment variable
  const senderId = decoded.id;
  try {
    const newMessage = await chatModel.create({ senderId, receiverId, message });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to save message', error });
  }
};




const loadchat = async (req, res) => {
  const patientId = req.params.id; 
  const token = req.header('Authorization')?.replace('Bearer ', ''); 
  const decoded = jwt.verify(token, '12345');  
  const doctorId = decoded.id;
  try {
    const messages = await chatModel.find({
      $or: [
        { senderId: patientId, receiverId: doctorId },
        { senderId: doctorId, receiverId: patientId },
      ],
    }).sort({ timestamp: 1 });  // Sort by timestamp, oldest first

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};


const viewappointments = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If token is not provided, respond with a 403 status
    if (!token) {
      return res.status(403).json({ message: 'Access denied, no token provided' });
    }

    // Verify the token and extract the decoded information
    const decoded = jwt.verify(token, '12345');  // Use your actual secret key here
    const doctorId = decoded.id;

    console.log('Doctor ID:', doctorId);

    // Fetch appointments related to this doctor
    const appointments = await appointmentModel.find({ doctorId });

    // If no appointments are found, respond with a 404 status
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found' });
    }

    // Map over the appointments to get detailed information
    const appointmentDetails = await Promise.all(appointments.map(async (appointment) => {
      // Fetch patient details excluding password
      const patientDetails = await patientModel.findById(appointment.patientId).select('-password').lean();
      
      // Fetch doctor details excluding password
      const doctorDetails = await doctorModel.findById(appointment.doctorId).select('-password').lean();

      // Return the appointment details along with patient and doctor details
      return {
        appointmentId: appointment._id,
        appointmentDate: appointment.date,
        status: appointment.status,
        patientDetails,
        doctorDetails,
      };
    }));
    console.log(appointmentDetails)
    // Respond with the detailed appointment information
    res.status(200).json(appointmentDetails);
  } catch (err) {
    // Handle errors (e.g., invalid token, database errors, etc.)
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




const createToken = (userId) => {
    return jwt.sign({ id: userId }, '12345', { expiresIn: '1h' }); 
  };
  
  //admin login ------------------>
  
  const doctorLogin = async (req, res) => {
    const email = req.body.username;
    const password = req.body.password
    try {
      const doc = await doctorModel.findOne({ email });
      if (!doc) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, doc.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const token = createToken(doc._id);
      console.log(token);
      const data = {
        name: doc.name,
        specialization: doc.specialization,
        phone: doc.phone,
        email: doc.email,
        address: doc.address,
        availabilityStatus: doc.availabilityStatus,
      }      
      res.status(200).json({
        message: 'Login successful',
        token: token,
        data:data

      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  module.exports = { doctorLogin, viewappointments, loadchat, saveChat, confirmappointment};
