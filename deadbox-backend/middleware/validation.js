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
  email: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],
  password: [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  name: [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .trim()
      .escape()
  ],
  familyEmail: [
    body('familyEmail')
      .isEmail()
      .withMessage('Please provide a valid family email address')
      .normalizeEmail()
  ],
  familyKey: [
    body('familyKey')
      .notEmpty()
      .withMessage('Family key is required')
      .isLength({ min: 6 })
      .withMessage('Family key must be at least 6 characters long')
      .trim()
  ],
  title: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters')
  ],
  message: [
    body('message')
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Message must be between 1 and 10000 characters')
  ],
  triggerType: [
    body('triggerType')
      .isIn(['date', 'inactivity'])
      .withMessage('Trigger type must be either "date" or "inactivity"')
  ],
  scheduledDate: [
    body('scheduledDate')
      .if(body('triggerType').equals('date'))
      .isISO8601()
      .withMessage('Scheduled date must be a valid ISO 8601 date')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        return date > now;
      })
      .withMessage('Scheduled date must be in the future')
  ],
  inactivityDays: [
    body('inactivityDays')
      .if(body('triggerType').equals('inactivity'))
      .isInt({ min: 1, max: 365 })
      .withMessage('Inactivity days must be between 1 and 365')
  ]
};

// Sanitize input
const sanitizeInput = (req, res, next) => {
  if (req.body.title) {
    req.body.title = sanitizeHtml(req.body.title, sanitizeOptions);
  }
  if (req.body.message) {
    req.body.message = sanitizeHtml(req.body.message, sanitizeOptions);
  }
  next();
};

// Validate input
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  commonRules,
  sanitizeInput,
  validateInput
}; 