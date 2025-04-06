const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${config.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Verify Your Deadbox Account',
    html: `
      <h1>Welcome to Deadbox!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 7 days. If you don't verify your account within this time, your account will be automatically deleted.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${config.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Reset Your Deadbox Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
}; 