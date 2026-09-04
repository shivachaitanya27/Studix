import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow all local dev ports (5173, 5174, 3000, etc.)
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Allow all Vercel deployment domains
    try {
      if (/\.vercel\.app$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
    } catch {
      // ignore URL parse
    }
    // Allow configured CLIENT_URL
    if (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

// Tiered Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});


app.use(globalLimiter);
app.use('/api/v1/auth', authLimiter);

// Serve uploaded documents statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(morgan('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Root route health info
app.get('/', (req, res, next) => {
  if (req.accepts('json') && !req.is('json')) {
    return res.json({
      message: 'Welcome to Studix API Engine',
      version: '1.0.0',
      status: 'healthy',
      documentation: '/api/v1/health'
    });
  }
  next();
});

// Mount API routes across /api/v1 (standard), /api (short), and root / (direct)
app.use('/api/v1', routes);
app.use('/api', routes);
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
