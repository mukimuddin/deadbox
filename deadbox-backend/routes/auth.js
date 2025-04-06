const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body } = require('express-validator');
const { commonRules, validateInput, sanitizeInput } = require('../middleware/validation');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const emailValidator = require('deep-email-validator');

// Function to validate email
async function isEmailValid(email) {
  try {
    const { valid, reason, validators } = await emailValidator.validate(email, {
      validateRegex: true,
      validateMx: true,
      validateTypo: false, // Disable typo checking as it can be too strict
      validateDisposable: false, // Disable disposable email check as it can block valid emails
      validateSMTP: false // SMTP validation can be slow and unreliable
    });

    // Log validation details for debugging
    console.log('Email validation result:', {
      email,
      valid,
      reason,
      validators
    });

    // Only check basic validation criteria
    if (!validators.regex.valid) {
      return { valid: false, reason: 'Invalid email format' };
    }
    if (!validators.mx.valid) {
      return { valid: false, reason: 'Invalid email domain' };
    }

    return {
      valid: true,
      reason: 'Email is valid'
    };
  } catch (error) {
    console.error('Email validation error:', error);
    // If validation fails, assume email is valid to prevent blocking legitimate users
    return { valid: true, reason: 'Validation skipped due to error' };
  }
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register a new user
router.post('/register',
  sanitizeInput,
  [
    commonRules.name,
    commonRules.email,
    commonRules.password,
    commonRules.familyKey,
    commonRules.familyEmail
  ],
  validateInput,
  async (req, res) => {
    try {
      const { name, email, password, familyKey, familyEmail } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Validate primary email
      const primaryEmailValidation = await isEmailValid(email);
      if (!primaryEmailValidation.valid) {
        return res.status(400).json({ 
          error: 'Invalid email address. Please use a real email.',
          details: primaryEmailValidation.reason
        });
      }

      // Validate family email
      const familyEmailValidation = await isEmailValid(familyEmail);
      if (!familyEmailValidation.valid) {
        return res.status(400).json({ 
          error: 'Invalid family email address. Please use a real email.',
          details: familyEmailValidation.reason
        });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = Date.now() + 24 * 3600000; // 24 hours

      // First try to send the verification email
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
      }

      // If email sent successfully, create the user
      const user = new User({
        name,
        email,
        password,
        familyKey,
        familyEmail,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      });

      await user.save();

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: Object.values(error.errors).map(err => err.message)
        });
      }
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('Unexpected registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }
);

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resend verification email
router.post('/resend-verification',
  [commonRules.email],
  validateInput,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = Date.now() + 24 * 3600000; // 24 hours

      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      await user.save();

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      res.json({ message: 'Verification email sent' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Login user
router.post('/login',
  sanitizeInput,
  [
    commonRules.email,
    commonRules.password
  ],
  validateInput,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({ 
          error: 'Email not verified',
          message: 'Please verify your email before logging in'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last activity
      user.lastActivity = new Date();
      await user.save();

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          familyEmail: user.familyEmail,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Request password reset
router.post('/forgot-password',
  [commonRules.email],
  validateInput,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // Send reset email
      try {
        await sendPasswordResetEmail(email, resetToken);
        res.json({ message: 'Password reset email sent' });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        res.status(500).json({ error: 'Failed to send password reset email. Please try again.' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Password reset request failed. Please try again.' });
    }
  }
);

// Reset password
router.post('/reset-password/:token',
  [
    commonRules.password,
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  validateInput,
  async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Set the new password (it will be hashed by the pre-save middleware)
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router; 