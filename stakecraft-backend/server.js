import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database.js";
import { getJwtSecret } from "./utils/jwtSecret.js";
import contentRoutes from "./routes/content.js";
import userRoutes from "./routes/users.js";
import mainnetRouter from "./routes/mainnet.js";
import testnetRouter from "./routes/testnet.js";
import partnershipRouter from "./routes/partnership.js";
import aboutRouter from "./routes/about.js";
import teamRouter from "./routes/team.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";

if (process.env.NODE_ENV === "production") {
  getJwtSecret();
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.FRONTEND_URL,
        "https://stakecraft.com",
        "https://www.stakecraft.com",
        ...(process.env.CORS_EXTRA_ORIGINS || "")
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ].filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:4173",
      ];

function isAllowedCorsOrigin(origin) {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return /^https:\/\/([a-f0-9]+\.)?stakecraft-com-development\.pages\.dev$/.test(
      origin
    );
  }

  return false;
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        if (process.env.NODE_ENV === "production") {
          return callback(new Error("Origin header required"));
        }
        return callback(null, true);
      }

      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());
app.use(morgan("combined"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mainnet", mainnetRouter);
app.use("/api/testnet", testnetRouter);
app.use("/api/partnership", partnershipRouter);
app.use("/api/about", aboutRouter);
app.use("/api/team", teamRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB().catch(console.dir);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
