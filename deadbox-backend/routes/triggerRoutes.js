const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation'); // Removed validateInput for GET

// Health check endpoint for triggers
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'triggers' });
});

// Protected trigger check endpoint
router.get('/check', 
  authenticate,
  sanitizeInput,
  async (req, res, next) => {
    try {
      // Assume some trigger validation logic
      const triggers = {
        status: 'ok',
        message: 'All triggers are functioning correctly',
        timestamp: new Date().toISOString(),
      };
      
      // Add more data or metrics about triggers if relevant
      res.status(200).json(triggers);
    } catch (error) {
      next(error); // Pass errors to error-handling middleware
    }
  }
);

module.exports = router;
