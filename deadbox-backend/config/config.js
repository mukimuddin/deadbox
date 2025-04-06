require('dotenv').config();

const config = {
  development: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/deadbox',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  production: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://deadbox.vercel.app'
  }
};

// Log the current configuration for debugging
const env = process.env.NODE_ENV || 'development';
console.log('Current environment:', env);
console.log('Frontend URL:', config[env].FRONTEND_URL);

module.exports = config[env]; 