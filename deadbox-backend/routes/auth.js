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
const { validationResult } = require('express-validator');

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
    console.log('Verifying email with token:', token);

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_token`);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully for user:', user.email);
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=verification_failed`);
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
router.post('/login', async (req, res) => {
  console.log('Login route: Received login request for email:', req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login route: Missing email or password.');
      return res.status(400).json({ 
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password'
      });
    }

    console.log('Login route: Found user:', user.email);
    
    if (!user.isEmailVerified) {
      console.log('Login route: Email not verified for user:', user.email);
      return res.status(401).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true
      });
    }

    console.log('Login route: Comparing password for user:', user.email);
    const isMatch = await user.comparePassword(password);
    console.log('Login route: Password match result:', isMatch);
    if (!isMatch) {
      console.log('Login route: Invalid password for user:', user.email);
      return res.status(401).json({ 
        message: 'Invalid email or password'
      });
    }

    console.log('Login route: Login successful for user:', user.email);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.lastActivity = new Date();
    await user.save();

    res.json({
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          familyEmail: user.familyEmail,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Login route: Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login'
    });
  }
});

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
    console.log('Reset password route: Received request for token:', req.params.token);
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        console.log('Reset password route: Invalid or expired token:', token);
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      console.log('Reset password route: Found user:', user.email);
      // Set the new password (it will be hashed by the pre-save middleware)
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      console.log('Reset password route: Attempting to save new password for user:', user.email);
      await user.save();
      console.log('Reset password route: New password saved successfully for user:', user.email);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password route: Error resetting password:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router; 