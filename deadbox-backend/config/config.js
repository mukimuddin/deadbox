require('dotenv').config();

const config = {
  development: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/deadbox',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    NODE_ENV: 'development'
  },
  production: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://deadbox.vercel.app',
    NODE_ENV: 'production'
  },
  test: {
    MONGODB_URI: 'mongodb://localhost:27017/deadbox-test',
    JWT_SECRET: 'test-secret-key',
    EMAIL_USER: 'test@example.com',
    EMAIL_PASS: 'test-password',
    FRONTEND_URL: 'http://localhost:5173',
    NODE_ENV: 'test'
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
console.log('Current environment:', env);
console.log('Frontend URL:', config[env].FRONTEND_URL);

// Validate required environment variables
const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
for (const varName of requiredVars) {
  if (!config[env][varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
}

module.exports = config[env]; 