// Environment loading and validation must happen before anything else imports
// config-dependent modules. This module exits the process if the configuration
// is insecure (for example a missing or placeholder JWT_SECRET).
import config from "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database.js";
import { mongoSanitize } from "./middleware/sanitize.js";
import contentRoutes from "./routes/content.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import mainnetRouter from "./routes/mainnet.js";
import testnetRouter from "./routes/testnet.js";
import partnershipRouter from "./routes/partnership.js";
import aboutRouter from "./routes/about.js";
import faqRouter from "./routes/faq.js";
import teamRouter from "./routes/team.js";
import productRouter from "./routes/product.js";

const app = express();
const PORT = config.port;
const isProduction = config.isProduction;

// Do not advertise the framework.
app.disable("x-powered-by");

// The app runs behind nginx. Without this every client appears to be 127.0.0.1
// and the rate limiter would throttle all users as a single bucket. The value
// is the exact number of trusted proxy hops - never `true`, which would let a
// client spoof its own address through X-Forwarded-For and evade the limiter.
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "no-referrer" },
  })
);

// Local Vite origins are always allowed so `npm run start` (NODE_ENV=production)
// on backend.dev still accepts requests from a laptop running the frontend.
const LOCAL_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const allowedOrigins = [
  ...LOCAL_DEV_ORIGINS,
  config.frontendUrl,
  "https://dev.stakecraft.com",
  "https://stakecraft.com",
  "https://www.stakecraft.com",
  ...config.extraCorsOrigins,
].filter(Boolean);

function isAllowedCorsOrigin(origin) {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^https:\/\/([a-f0-9]+\.)?stakecraft-com-development\.pages\.dev$/.test(
    origin
  );
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Requests without an Origin header (curl, server-to-server, health
      // probes) are allowed through: CORS is a browser control and cannot be
      // an authentication boundary. Authorisation is enforced per route.
      if (!origin) return callback(null, true);

      if (isAllowedCorsOrigin(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  })
);

// Body parsing middleware. 10mb was sized for base64 image payloads; keep it
// but apply it only where it is needed rather than to every endpoint.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Strip MongoDB operators from all user-supplied input.
app.use(mongoSanitize);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(isProduction ? "combined" : "dev"));

// Health check BEFORE rate limiter (monitoring must not consume the API quota)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

const skipWhenDisabled = () => process.env.DISABLE_RATE_LIMIT === "true";

// Rate limiting: admin + home load many endpoints in parallel; 100/15min breaks normal use.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 800 : 5000,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhenDisabled,
});

// Credential endpoints get a much tighter budget. Only failed attempts count,
// so a working admin session is never locked out by its own activity.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 100,
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipWhenDisabled,
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/setup", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mainnet", mainnetRouter);
app.use("/api/testnet", testnetRouter);
app.use("/api/partnership", partnershipRouter);
app.use("/api/about", aboutRouter);
app.use("/api/faq", faqRouter);
app.use("/api/team", teamRouter);
app.use("/api/products", productRouter);

// 404 handler - must come after every route but before the error handler.
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler. Registered last so it also catches failures raised by
// the handlers above. Internal details are logged but never returned in
// production, where a stack trace or driver message aids an attacker.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large" });
  }

  console.error("Unhandled error:", err);

  return res.status(err?.status || 500).json({
    error: "Internal server error",
    ...(isProduction ? {} : { message: err?.message }),
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${config.nodeEnv}]`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the other process or set PORT in .env.`
        );
      } else {
        console.error("HTTP server error:", err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Allow the test suite to import the app without binding a port.
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
