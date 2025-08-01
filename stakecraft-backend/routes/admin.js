import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import Content from "../models/Content.js";
import User from "../models/User.js";

const router = express.Router();

// Admin dashboard statistics
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      Content.countDocuments({ type: "menu" }),
      Content.countDocuments({ type: "mainnet" }),
      Content.countDocuments({ type: "testnet" }),
      Content.countDocuments({ type: "partnership" }),
      Content.countDocuments({ type: "about" }),
      Content.countDocuments({ type: "team" }),
      User.countDocuments(),
      Content.countDocuments({ isActive: true }),
      Content.countDocuments({ isActive: false }),
    ]);

    const [
      menuCount,
      mainnetCount,
      testnetCount,
      partnershipCount,
      aboutCount,
      teamCount,
      userCount,
      activeContent,
      inactiveContent,
    ] = stats;

    res.json({
      contentStats: {
        menu: menuCount,
        mainnet: mainnetCount,
        testnet: testnetCount,
        partnership: partnershipCount,
        about: aboutCount,
        team: teamCount,
        total:
          menuCount +
          mainnetCount +
          testnetCount +
          partnershipCount +
          aboutCount +
          teamCount,
        active: activeContent,
        inactive: inactiveContent,
      },
      userStats: {
        total: userCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Get all content for admin panel
router.get("/content", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, page = 1, limit = 20, search } = req.query;

    let query = {};
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin content error:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

// Get content types for admin panel
router.get(
  "/content-types",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const types = [
        { value: "menu", label: "Menu Items" },
        { value: "mainnet", label: "Mainnet Cards" },
        { value: "testnet", label: "Testnet Cards" },
        { value: "partnership", label: "Partnerships" },
        { value: "about", label: "About Section" },
        { value: "team", label: "Team Members" },
      ];

      res.json(types);
    } catch (error) {
      console.error("Get content types error:", error);
      res.status(500).json({ error: "Failed to fetch content types" });
    }
  }
);

// Bulk operations
router.post(
  "/content/bulk-action",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { action, ids } = req.body;

      if (!action || !ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }

      let result;
      switch (action) {
        case "activate":
          result = await Content.updateMany(
            { _id: { $in: ids } },
            { isActive: true }
          );
          break;
        case "deactivate":
          result = await Content.updateMany(
            { _id: { $in: ids } },
            { isActive: false }
          );
          break;
        case "delete":
          result = await Content.deleteMany({ _id: { $in: ids } });
          break;
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      res.json({
        message: `Bulk action '${action}' completed successfully`,
        modifiedCount: result.modifiedCount || result.deletedCount,
      });
    } catch (error) {
      console.error("Bulk action error:", error);
      res.status(500).json({ error: "Failed to perform bulk action" });
    }
  }
);

// Get system information
router.get(
  "/system-info",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      };

      res.json(systemInfo);
    } catch (error) {
      console.error("System info error:", error);
      res.status(500).json({ error: "Failed to fetch system information" });
    }
  }
);

export default router;
