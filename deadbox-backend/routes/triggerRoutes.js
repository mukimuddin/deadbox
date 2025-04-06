const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sanitizeInput, validateInput } = require('../middleware/validation');

// Health check endpoint for triggers
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'triggers' });
});

// Protected trigger check endpoint
router.get('/check', 
  authenticate,
  sanitizeInput,
  validateInput,
  (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      message: 'Trigger check successful',
      timestamp: new Date().toISOString()
    });
  }
);

module.exports = router;
