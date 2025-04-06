require('dotenv').config();

const config = {
  development: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/deadbox',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: 'http://localhost:5173'
  },
  production: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: 'https://deadbox.vercel.app'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 