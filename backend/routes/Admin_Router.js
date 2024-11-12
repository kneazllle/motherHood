const express = require('express');
const { adminLogin, addDoc, fetchDoc, updateDoc, delDoc } = require('../controller/adminController');

const adminRouter = express.Router();

// Routes for admin actions
adminRouter.post('/login', adminLogin);   // Admin login route
adminRouter.post('/addDoc', addDoc);      // Add doctor route
adminRouter.post('/fetchDoc', fetchDoc);  // Fetch all doctors route
adminRouter.put('/updateDoc/:id', updateDoc); // Update doctor by ID route
adminRouter.delete('/delDoc/:id', delDoc);  // Delete doctor by ID route

module.exports = adminRouter;
