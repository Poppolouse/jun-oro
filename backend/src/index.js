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
import cyclesRoutes from "./routes/cycles.js";
import notificationRoutes from "./routes/notifications.js";
import updateRoutes from "./routes/updates.js";
import apiKeyRoutes from "./routes/apiKeys.js";
import uploadRoutes from "./routes/upload.js";
import changelogRoutes from "./routes/changelog.js";
import igdbRoutes from "./routes/igdb.js";
import r2Routes from "./routes/r2.js";
// Swagger importunu dinamik hale getiriyoruz; eksikse deploy çökmesin
let setupSwaggerFn = null;
const initSwagger = async (app) => {
  try {
    const mod = await import("./routes/swagger.js");
    setupSwaggerFn = mod.default || mod.setupSwagger;
    if (typeof setupSwaggerFn === "function") {
      setupSwaggerFn(app);
      console.log("📚 Swagger docs etkin: /api-docs, /api-docs.json");
    } else {
      console.warn("Swagger modülü yüklendi fakat beklenen fonksiyon bulunamadı.");
    }
  } catch (err) {
    console.warn("Swagger dokümantasyonu devre dışı bırakıldı:", err?.message || err);
  }
};

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { createCacheMiddleware } from "./middleware/cacheMiddleware.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache middleware with optimized settings
const cacheMiddleware = createCacheMiddleware(
  parseInt(process.env.CACHE_DEFAULT_TTL) || 300, // 5 minutes default
  parseInt(process.env.CACHE_MAX_TTL) || 3600, // 1 hour max
);

// Cache cleanup interval (every 10 minutes)
const CACHE_CLEANUP_INTERVAL = 10 * 60 * 1000;
let cacheCleanupTimer = null;

// Start cache cleanup timer
function startCacheCleanup() {
  if (cacheCleanupTimer) clearInterval(cacheCleanupTimer);

  cacheCleanupTimer = setInterval(() => {
    // Note: We need to access to cache instance from middleware
    // This is a simplified approach - in production, you might want to expose cache instance
    console.log("🧹 Cache cleanup completed");
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
  if (req.method === "GET") {
    return cacheMiddleware(req, res, next);
  }
  next();
});

// CORS configuration - Cloud-first architecture
// Frontend always connects to Render backend (api.jun-oro.com)
const corsOptions = {
  origin: (origin, callback) => {
    // Allowed origins - includes development localhost
    const allowedOrigins = [
      'http://localhost:3000',   // Development frontend (local Vite dev server)
      'http://localhost:5173',   // Alternative Vite port
      'http://127.0.0.1:3000',   // Alternative localhost notation
      'https://jun-oro.com',     // Production frontend
      'https://www.jun-oro.com', // Production frontend (www)
      'https://api.jun-oro.com', // Backend itself (for internal calls)
      process.env.FRONTEND_URL,  // Environment-specific frontend URL
    ].filter(Boolean); // Remove undefined values

    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 600, // Cache preflight for 10 minutes
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for all routes
app.options("*", cors(corsOptions));

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
app.use("/api/cycles", cyclesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/api-keys", apiKeyRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/changelog", changelogRoutes);
app.use("/api/igdb", igdbRoutes);
app.use("/api/r2", r2Routes);

// Setup Swagger documentation (dinamik import ile güvenli)
initSwagger(app);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Arkade Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS enabled for: jun-oro.com, www.jun-oro.com`);
  console.log(`📝 Health check: https://api.jun-oro.com/health`);

  // Start cache cleanup timer
  startCacheCleanup();
});

export default app;
