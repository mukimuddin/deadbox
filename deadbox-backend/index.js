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
const letterRoutes = require("./routes/letterRoutes");
const authRoutes = require("./routes/auth");
const { checkInactivity, checkScheduledDeliveries } = require("./services/triggerService");

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS must be before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Security middleware
setupSecurity(app);
setupPerformance(app);
app.use(sanitizeInput);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/letters", letterRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log("Connected to MongoDB");
  // Setup database indexes
  setupIndexes();
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Background jobs
setInterval(async () => {
  await checkInactivity();
  await checkScheduledDeliveries();
}, 24 * 60 * 60 * 1000); // Run every 24 hours

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});