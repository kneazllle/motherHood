const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const adminRouter = require('./routes/Admin_Router.js');
const doctorRouter = require('./routes/Doctor_Router.js');
const patientRouter = require('./routes/Patient_Router.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Registering the admin router
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/patients', patientRouter)
// Connect to the database
connectDB();


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

