/** Create a Node.js server with Express, connect to MongoDB, and define routes for:

User authentication (JWT)

CRUD for dead letters (messages)

Trigger check (last activity)

Email sending logic with Nodemailer */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { corsOptions } = require("./middleware/security");
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { validateInput } = require('./middleware/validation');
const { xssProtection } = require('./middleware/security');
const userRoutes = require("./routes/userRoutes");
const letterRoutes = require("./routes/letters");
const authRoutes = require("./routes/auth");
const { checkInactivity, checkScheduledDeliveries } = require("./services/triggerService");
const { cleanupUnverifiedAccounts } = require('./services/cleanupService');

const app = express();

// Enable CORS with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse JSON payloads
app.use(express.json());

// Security middleware
app.use(xssProtection);
app.use(rateLimiter);
app.use(validateInput);

// Log environment and frontend URL
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Schedule cleanup of unverified accounts
// Run every day at midnight
setInterval(cleanupUnverifiedAccounts, 24 * 60 * 60 * 1000);

// Run cleanup on server start
cleanupUnverifiedAccounts();

// Error handling middleware
app.use(errorHandler);

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts remaining)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

connectDB();

// Background jobs
setInterval(async () => {
  await checkInactivity();
  await checkScheduledDeliveries();
}, 24 * 60 * 60 * 1000); // Run every 24 hours

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = app;