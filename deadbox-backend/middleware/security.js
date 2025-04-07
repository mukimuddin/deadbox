const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: 'Too many requests from this IP, please try again later'
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://deadbox.vercel.app',
      'https://deadbox-git-main.vercel.app',
      'https://deadbox-git-main-your-username.vercel.app'
    ];

    if (process.env.NODE_ENV === 'development') {
      callback(null, true); // Allow all origins in development
    } else if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Allow specific origins in production
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Input validation middleware
const validateLetterInput = (req, res, next) => {
  const { title, message, triggerType, scheduledDate, inactivityDays } = req.body;
  
  if (!title || !message || !triggerType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (triggerType === 'date' && !scheduledDate) {
    return res.status(400).json({ error: 'Scheduled date is required for date trigger' });
  }

  if (triggerType === 'inactivity' && !inactivityDays) {
    return res.status(400).json({ error: 'Inactivity days is required for inactivity trigger' });
  }

  next();
};

// Security middleware setup
const setupSecurity = (app) => {
  // Configure helmet with CORS-friendly settings
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  }));
  
  // Prevent XSS attacks
  app.use(xss());
  
  // Sanitize mongo queries
  app.use(mongoSanitize());
  
  // Prevent parameter pollution
  app.use(hpp());
  
  // Apply rate limiting to all routes
  app.use(limiter);
};

const xssProtection = xss();

module.exports = {
  limiter,
  corsOptions,
  validateLetterInput,
  setupSecurity,
  xssProtection
}; 