import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Login route
router.post(
  "/login",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

// Logout route (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Create admin user (for initial setup)
router.post(
  "/setup",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if admin already exists
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin user already exists" });
      }

      // Create admin user
      const adminUser = new User({
        username,
        email,
        password,
        role: "admin",
      });

      await adminUser.save();

      res.status(201).json({
        message: "Admin user created successfully",
        user: {
          id: adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
    } catch (error) {
      console.error("Setup error:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ error: "Username or email already exists" });
      }
      res.status(500).json({ error: "Failed to create admin user" });
    }
  }
);

export default router;
