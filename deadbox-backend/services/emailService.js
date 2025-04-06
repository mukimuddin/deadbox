const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASS
    });
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Generic send email function
const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Using email configuration:', {
      from: process.env.EMAIL_USER,
      subject
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASS
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${config.FRONTEND_URL}/verify-email/${token}`;
    console.log('Sending verification email with link:', verificationLink);

    await sendEmail({
      to: email,
      subject: 'Verify Your Deadbox Account',
      html: `
        <h1>Welcome to Deadbox!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 7 days. If you don't verify your account within this time, your account will be automatically deleted.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `
    });

    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetLink = `${config.FRONTEND_URL}/reset-password/${token}`;
    console.log('Sending password reset email with link:', resetLink);

    await sendEmail({
      to: email,
      subject: 'Reset Your Deadbox Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and ensure your account is secure.</p>
      `
    });

    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
}; 