const express = require('express');
const { signup, login, dispDoc, prevappointments, getAvailableSlots, saveChat, getMessages, appointments} = require('../controller/patientController');

const patientRouter = express.Router();

patientRouter.post('/signup', signup);  
patientRouter.post('/login', login);  
patientRouter.get('/dispDoc', dispDoc);  
patientRouter.get('/prevappointments', prevappointments);  
patientRouter.get('/available_timeslots', getAvailableSlots); 
patientRouter.post('/appointments', appointments); 
patientRouter.post('/savechat', saveChat); 
patientRouter.get('/loadchat/:id', getMessages); 

module.exports = patientRouter;
