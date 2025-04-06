const compression = require('compression');
const NodeCache = require('node-cache');

// Create a cache instance
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

// Setup database indexes
const setupIndexes = async () => {
  try {
    const User = require('../models/User');
    const Letter = require('../models/Letter');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ emailVerificationToken: 1 });
    await User.collection.createIndex({ resetPasswordToken: 1 });

    // Letter indexes
    await Letter.collection.createIndex({ userId: 1 });
    await Letter.collection.createIndex({ scheduledDate: 1 });
    await Letter.collection.createIndex({ triggerType: 1 });
  } catch (error) {
    console.error('Error setting up indexes:', error);
  }
};

// Performance middleware setup
const setupPerformance = (app) => {
  // Enable compression
  app.use(compression());

  // Cache middleware
  app.use((req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.send(cachedResponse);
    }

    // Store the original send function
    const originalSend = res.send;

    // Override the send function to cache the response
    res.send = function(body) {
      cache.set(key, body);
      originalSend.call(this, body);
    };

    next();
  });
};

module.exports = {
  setupPerformance,
  setupIndexes
}; 