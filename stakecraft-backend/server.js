import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database.js";
// import healthRoutes from "./routes/health.js";
// import adminRoutes from "./routes/admin.js";
import contentRoutes from "./routes/content.js";
// import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
// import mainRouter from "./routes/main.js";
// import netRouter from "./routes/mainnet.js";
import mainnetRouter from "./routes/mainnet.js";
import testnetRouter from "./routes/testnet.js";
import partnershipRouter from "./routes/partnership.js";
import aboutRouter from "./routes/about.js";
import teamRouter from "./routes/team.js";
// const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:3000" ||
      "http://localhost:5173" ||
      "https://103.179.45.100",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

// Health endpoint (no rate limiting for monitoring)
// app.get("/api/health", (req, res) => {
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
// app.use("/api/health", healthRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mainnet", mainnetRouter);
app.use("/api/testnet", testnetRouter);
app.use("/api/partnership", partnershipRouter);
app.use("/api/about", aboutRouter);
app.use("/api/team", teamRouter);

// Error handling middlewares
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

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// Start server
const startServer = async () => {
  try {
    await connectDB().catch(console.dir);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/health`);
      console.log(`Admin panel: http://localhost:${PORT}/api/admin`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
