const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

const allowedOrigins = {
  production: [
    'https://deadbox.vercel.app',
    'https://www.deadbox.vercel.app',
    'https://deadbox.onrender.com'
  ],
  development: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ]
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://deadbox.vercel.app', 'https://www.deadbox.vercel.app', 'https://deadbox.onrender.com']
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
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
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", 
          "http://localhost:5000", 
          "http://localhost:5173",
          "http://localhost:5174",
          "https://deadbox.vercel.app",
          "https://www.deadbox.vercel.app",
          "https://deadbox.onrender.com"
        ],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:", "blob:"],
        frameSrc: ["'self'"]
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