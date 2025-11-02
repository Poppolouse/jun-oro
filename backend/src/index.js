import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/users.js';
import gameRoutes from './routes/games.js';
import libraryRoutes from './routes/library.js';
import sessionRoutes from './routes/sessions.js';
import preferencesRoutes from './routes/preferences.js';
import statsRoutes from './routes/stats.js';
import campaignRoutes from './routes/campaigns.js';
import notificationRoutes from './routes/notifications.js';
import updateRoutes from './routes/updates.js';
import apiKeyRoutes from './routes/apiKeys.js';
import uploadRoutes from './routes/upload.js';
import changelogRoutes from './routes/changelog.js';
import igdbRoutes from './routes/igdb.js';
import r2Routes from './routes/r2.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// CORS configuration (allow multiple local dev origins)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Arkade Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/igdb', igdbRoutes);
app.use('/api/r2', r2Routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Arkade Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

export default app;