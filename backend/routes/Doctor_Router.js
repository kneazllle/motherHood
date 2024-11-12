const express = require('express');
const { doctorLogin, viewappointments, loadchat, saveChat, confirmappointment} = require('../controller/doctorController');

const doctorRouter = express.Router();

doctorRouter.post('/login', doctorLogin); 
doctorRouter.get('/viewappointments', viewappointments);  
doctorRouter.get('/loadchat/:id', loadchat);  
doctorRouter.post('/savechat', saveChat);  
doctorRouter.post('/confirmappointment', confirmappointment); 


module.exports = doctorRouter;
