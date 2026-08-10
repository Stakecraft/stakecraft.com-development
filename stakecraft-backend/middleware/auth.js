import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import config from "../config/env.js";

/**
 * Verifies the bearer token and loads the matching user onto req.user.
 * Every mutating route must sit behind this.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const [scheme, token] = authHeader.split(" ");

    if (!token || scheme.toLowerCase() !== "bearer") {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"], // pin the algorithm: blocks alg=none / alg confusion
    });

    if (!decoded?.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Never carry the password hash around on req.user.
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }

    // The role lives in the token but is authoritative only in the database.
    // Re-reading it here means a demoted admin loses access immediately
    // instead of when their old token happens to expire.
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};

/**
 * Builds a role gate. Fails closed if authenticateToken did not run first,
 * so a wiring mistake can never silently expose a route.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    console.error(
      "requireRole used without authenticateToken - refusing the request"
    );
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  return next();
};

export const requireAdmin = requireRole("admin");
export const requireEditor = requireRole("admin", "editor");

/**
 * Allows a user to act on their own record, or an admin to act on anyone's.
 * Used for password changes and profile updates.
 */
export const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const targetId = req.params.id;
  if (req.user.role === "admin" || req.user._id.toString() === targetId) {
    return next();
  }
  return res.status(403).json({ error: "Insufficient permissions" });
};

export const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn, algorithm: "HS256" }
  );
