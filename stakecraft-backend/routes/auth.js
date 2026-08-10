import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { authenticateToken, signToken } from "../middleware/auth.js";
import config from "../config/env.js";

const router = express.Router();

// A precomputed hash of a value nobody uses. When the supplied username does
// not exist we still run one bcrypt comparison against it, so a failed login
// takes the same time whether or not the account is real. Without this, the
// response time alone reveals which usernames exist.
const DUMMY_HASH = bcrypt.hashSync("unused-placeholder-password", 10);

const credentialRules = [
  // isString() is the important part: without it a JSON body of
  // {"username": {"$ne": null}} reaches the query as a MongoDB operator and
  // matches the first user in the collection, bypassing authentication.
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ max: 254 }),
  // No minimum length here on purpose. Login must accept whatever the account
  // already has; policy is enforced when a password is set, not when it is used.
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 200 }),
];

// Login route
router.post("/login", credentialRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const { username, password } = req.body;

    // Both operands are guaranteed strings by the validation above.
    const user = await User.findOne({
      $or: [{ username }, { email: String(username).toLowerCase() }],
    });

    if (!user || !user.isActive) {
      await bcrypt.compare(password, DUMMY_HASH); // equalise timing
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      expiresIn: config.jwt.expiresIn,
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
});

// Get current user
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
    },
  });
});

// Logout route (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

/**
 * Bootstrap route for the very first admin.
 *
 * Disabled unless ALLOW_PUBLIC_SETUP=true, because an internet-reachable
 * account-creation endpoint is exactly the exposure being remediated. The
 * supported path is `npm run create-admin`, which runs on the server with no
 * network exposure at all.
 */
router.post(
  "/setup",
  [
    body("username").isString().trim().isLength({ min: 3, max: 30 }),
    body("email").isString().isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 12, max: 200 }),
  ],
  async (req, res) => {
    if (!config.allowPublicSetup) {
      return res.status(404).json({ error: "Route not found" });
    }

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Only ever usable while no admin exists.
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(409).json({ error: "Admin user already exists" });
      }

      const adminUser = new User({ username, email, password, role: "admin" });
      await adminUser.save();

      console.warn(
        `Admin "${username}" created through the public setup route. ` +
          "Set ALLOW_PUBLIC_SETUP=false now."
      );

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
        return res.status(400).json({ error: "Username or email already exists" });
      }
      res.status(500).json({ error: "Failed to create admin user" });
    }
  }
);

export default router;
