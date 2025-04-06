/** Create a Node.js server with Express, connect to MongoDB, and define routes for:

User authentication (JWT)

CRUD for dead letters (messages)

Trigger check (last activity)

Email sending logic with Nodemailer */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { setupSecurity, corsOptions } = require("./middleware/security");
const { setupPerformance, setupIndexes } = require("./middleware/performance");
const { sanitizeInput } = require("./middleware/validation");
const userRoutes = require("./routes/userRoutes");
const letterRoutes = require("./routes/letters");
const authRoutes = require("./routes/auth");
const { checkInactivity, checkScheduledDeliveries } = require("./services/triggerService");
const { cleanupUnverifiedAccounts } = require('./services/cleanupService');

const app = express();

// Log environment and configuration
console.log('Current environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Apply security middleware
setupSecurity(app);

// Apply performance middleware
setupPerformance(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Schedule cleanup of unverified accounts
// Run every day at midnight
setInterval(cleanupUnverifiedAccounts, 24 * 60 * 60 * 1000);

// Run cleanup on server start
cleanupUnverifiedAccounts();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true,
  w: 'majority'
})
.then(() => {
  console.log("Connected to MongoDB");
  // Setup database indexes
  setupIndexes();
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  setTimeout(() => {
    console.log("Retrying MongoDB connection...");
    mongoose.connect(process.env.MONGODB_URI);
  }, 5000);
});

// Handle MongoDB disconnection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI);
  }, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Background jobs
setInterval(async () => {
  await checkInactivity();
  await checkScheduledDeliveries();
}, 24 * 60 * 60 * 1000); // Run every 24 hours

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(503).json({
      error: 'Database Error',
      message: 'A database error occurred. Please try again later.'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Give the server time to finish current requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;