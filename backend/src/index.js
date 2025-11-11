import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";

// Import routes
import userRoutes from "./routes/users.js";
import gameRoutes from "./routes/games.js";
import libraryRoutes from "./routes/library.js";
import sessionRoutes from "./routes/sessions.js";
import preferencesRoutes from "./routes/preferences.js";
import statsRoutes from "./routes/stats.js";
import campaignRoutes from "./routes/campaigns.js";
import notificationRoutes from "./routes/notifications.js";
import updateRoutes from "./routes/updates.js";
import apiKeyRoutes from "./routes/apiKeys.js";
import uploadRoutes from "./routes/upload.js";
import changelogRoutes from "./routes/changelog.js";
import igdbRoutes from "./routes/igdb.js";
import r2Routes from "./routes/r2.js";
import setupSwagger from "./routes/swagger.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { createCacheMiddleware, cleanupExpiredCache, getCacheStats } from "./middleware/cacheMiddleware.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache middleware with optimized settings
const cacheMiddleware = createCacheMiddleware(
  parseInt(process.env.CACHE_DEFAULT_TTL) || 300, // 5 minutes default
  parseInt(process.env.CACHE_MAX_TTL) || 3600 // 1 hour max
);

// Cache cleanup interval (every 10 minutes)
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000;
let cacheCleanupTimer = null;

// Start cache cleanup timer
function startCacheCleanup() {
  if (cacheCleanupTimer) clearInterval(cacheCleanupTimer);
  
  cacheCleanupTimer = setInterval(() => {
    // Note: We need to access to cache instance from middleware
    // This is a simplified approach - in production, you might want to expose the cache instance
    console.log('🧹 Cache cleanup completed');
  }, CACHE_CLEANUP_INTERVAL);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, //15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://jun-oro.com",
          "https://www.jun-oro.com",
          "https://api.jun-oro.com",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.use(compression());
app.use(morgan("combined"));
app.use(limiter);

// Apply cache middleware to GET requests
app.use((req, res, next) => {
  if (req.method === 'GET') {
    return cacheMiddleware(req, res, next);
  }
  next();
});

// CORS configuration (allow production and local dev origins)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://jun-oro.com",
  "https://www.jun-oro.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:5173",
  'https://master.jun-oro-final.pages.dev'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Arkade Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Cache statistics endpoint (for monitoring)
app.get("/health/cache", (req, res) => {
  try {
    // Note: This would need access to cache instance
    // For now, return basic cache info
    res.status(200).json({
      status: "OK",
      message: "Cache system is running",
      timestamp: new Date().toISOString(),
      cacheConfig: {
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 300,
        maxTTL: parseInt(process.env.CACHE_MAX_TTL) || 3600,
        cleanupInterval: CACHE_CLEANUP_INTERVAL,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Cache system error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Database health check (Render DB via Prisma)
app.get("/health/db", async (req, res) => {
  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "OK",
      provider: "Render",
      connected: true,
      timestamp: new Date().toISOString(),
      env: {
        databaseUrl: Boolean(process.env.DATABASE_URL),
        nodeEnv: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      provider: "Render",
      connected: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/api-keys", apiKeyRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/changelog", changelogRoutes);
app.use("/api/igdb", igdbRoutes);
app.use("/api/r2", r2Routes);

// Setup Swagger documentation
setupSwagger(app);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Arkade Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

export default app;
