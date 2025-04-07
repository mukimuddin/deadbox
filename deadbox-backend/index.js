/** Create a Node.js server with Express, connect to MongoDB, and define routes for:

User authentication (JWT)

CRUD for dead letters (messages)

Trigger check (last activity)

Email sending logic with Nodemailer */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require('helmet');
const { corsOptions, setupSecurity } = require("./middleware/security");
const errorHandler = require('./middleware/errorHandler');
const { validateInput } = require('./middleware/validation');
const userRoutes = require("./routes/userRoutes");
const letterRoutes = require("./routes/letters");
const authRoutes = require("./routes/auth");
const { checkInactivity, checkScheduledDeliveries } = require("./services/triggerService");
const { cleanupUnverifiedAccounts } = require('./services/cleanupService');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - must come before routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware
setupSecurity(app);

// Log environment and frontend URL
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/triggers', require('./routes/triggerRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Schedule cleanup of unverified accounts
setInterval(cleanupUnverifiedAccounts, 24 * 60 * 60 * 1000);
cleanupUnverifiedAccounts();

// Error handling middleware - must be last
app.use(errorHandler);

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => connectDB(1), 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
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

// Start MongoDB connection
connectDB();

// Background jobs
setInterval(async () => {
  try {
    await checkInactivity();
    await checkScheduledDeliveries();
  } catch (error) {
    console.error('Background job error:', error);
  }
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;

// Function to start the server
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Graceful shutdown
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated');
    });
  });
};

// Start the server
startServer(PORT);

module.exports = app;