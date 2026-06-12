const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

const path = require('path');
const initCronJobs = require('./src/services/cronService');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Cron Jobs
initCronJobs();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/residents', require('./src/routes/residentRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('PUST Hall Payment API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
