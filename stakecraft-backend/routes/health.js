import express from "express";

const router = express.Router();

// Detailed health check
router.get("/detailed", (req, res) => {
  const healthData = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    database: {
      status: "connected", // This would be checked in a real implementation
    },
  };

  res.status(200).json(healthData);
});

// Simple health check for monitoring systems
router.get("/simple", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

export default router;
