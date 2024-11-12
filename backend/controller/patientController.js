const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const patientModel = require('../models/patientModel')
const doctorModel =require('../models/doctorModel')
const appointmentsModel = require('../models/appointmentModel')
const chatModel = require('../models/chatModel');
const moment = require('moment');



const getMessages = async (req, res) => {
  const doctorId = req.params.id; 
  console.log(doctorId);
  const token = req.header('Authorization')?.replace('Bearer ', ''); 
  const decoded = jwt.verify(token, '12345');  // Using jwt_secret from environment variable
  const patientId = decoded.id;
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


const saveChat = async (req, res) => {
  const { receiverId, message } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', ''); 
  const decoded = jwt.verify(token, '12345');  // Using jwt_secret from environment variable
  const senderId = decoded.id;
  const sent = 0;
  try {
    const newMessage = await chatModel.create({ senderId, receiverId, message ,sent});
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to save message', error });
  }
};


const appointments = async (req, res) => {
  console.log(req.body)
  const { doctorId, date, timeSlot } = req.body;
  const token = req.header('Authorization')?.replace('Bearer ', '');   const decoded = jwt.verify(token, '12345');  // Using jwt_secret from environment variable
  const patientId = decoded.id;
  console.log(token)
  console.log(token)
  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
  
    const newAppointment = new appointmentsModel({
      patientId:patientId,
      doctorId,
      date,
      timeSlot,
      status: 'Pending', // Default status is 'Pending'
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json({ savedAppointment, message: 'saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    // Default time slots array (8 AM to 2:30 PM, 30-minute intervals)
    const defaultSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
      "12:00", "12:30", "01:00", "01:30", "02:00", "02:30"
    ];

    // Generate time slots in the format 'YYYY-MM-DD HH:mm' based on the selected date
    const slots = defaultSlots.map((time) => {
      return moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
    });

    // Prepare start and end of the day for the query (to avoid timezone issues)
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    // Find existing appointments for the selected doctor and date
    const existingAppointments = await appointmentsModel.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay, // Ensure we check all appointments within the given date
      },
    });
    console.log(existingAppointments)

    const timeSlotsArray = []; // Array to store the formatted time slots

existingAppointments.forEach(element => {
  const specificTime = moment(element.timeSlot, 'HH:mm');

  // Check if the parsed time is valid
  if (specificTime.isValid()) {
    const time = specificTime.format('HH:mm'); // Format time as HH:mm
    timeSlotsArray.push(time); // Append the formatted time to the array
    console.log(time); // Optionally log each time
  } else {
    console.error('Invalid date format:', element.timeSlot); // Log invalid timeSlot
  }
});

console.log(timeSlotsArray); // Output the final array of valid time slots
const slotsWithStatus = defaultSlots.map(slot => {
  const status = timeSlotsArray.includes(slot) ? 'Pending' : 'Free';
  
  return { timeSlot: slot, status: status };
});

    res.json({ slotsWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};







// Route to fetch all doctors
const dispDoc = async (req, res) => {
  try {
    const doctors = await doctorModel.find();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const prevappointments = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Extract the token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, '12345');  // Using jwt_secret from environment variable
    const patientId = decoded.id;  // Assuming your token contains _id as the patientId)

    // Fetch appointments and populate the doctorId field with the doctor's name
    const appointments = await appointmentsModel.find({ patientId })
      .populate('doctorId', 'name');  // Populating the doctorId field with the 'name' field

    console.log(appointments.length);
    res.json(appointments);
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};




const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  
  try {
    // Find the patient by email
    const patient = await patientModel.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log(bcrypt.password);
    console.log(patient.password)
    // Compare the password with the stored hash
    const isMatch = await bcrypt.compare(password, patient.password);
    console.log(isMatch)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a token
    const token = jwt.sign({ id: patient._id }, '12345', { expiresIn: '1h' });

    // Remove the password from the patient data
    const patientData = patient.toObject();
    delete patientData.password;
    delete patientData._id;
    // Send response with the token and patient data
    return res.json({ token, patient: patientData });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




const signup = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, address, expectedDelivery, lifestyleDiseases, checkupDates } = req.body;

    // Check if the email already exists
    const existingPatient = await patientModel.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new patient
    const newPatient = new patientModel({
      name,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      address,
      expectedDelivery,
      lifestyleDiseases,
      checkupDates
    });

    // Save the new patient to the database
    await newPatient.save();

    // Send a success response
    res.status(201).json({ message: 'Patient signed up successfully', patient: newPatient });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  
module.exports = { signup, login, dispDoc, prevappointments, getAvailableSlots, appointments, saveChat, getMessages};
