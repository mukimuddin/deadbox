const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Sanitization options
const sanitizeOptions = {
  allowedTags: ['p', 'br', 'b', 'i', 'em', 'strong'],
  allowedAttributes: {},
  allowedIframeHostnames: []
};

// Common validation rules
const commonRules = {
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  email: body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain at least one letter and one number'),

  familyKey: body('familyKey')
    .trim()
    .isLength({ min: 6, max: 50 })
    .withMessage('Family key must be between 6 and 50 characters'),

  familyEmail: body('familyEmail')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid family email address'),

  title: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .customSanitizer(value => sanitizeHtml(value)),

  message: body('message')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message cannot be empty')
    .customSanitizer(value => sanitizeHtml(value)),

  triggerType: body('triggerType')
    .trim()
    .isIn(['date', 'inactivity'])
    .withMessage('Invalid trigger type'),

  scheduledDate: body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  inactivityDays: body('inactivityDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Inactivity days must be between 1 and 365')
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key]);
      }
    });
  }
  next();
};

// Validate input against rules
const validateInput = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => err.msg)
    });
  }
  next();
};

module.exports = {
  commonRules,
  sanitizeInput,
  validateInput
}; 