import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getCurrentUser,
  updateCurrentUser,
  validateUserCreation,
  validateUserUpdate,
  validatePasswordChange,
} from "../controllers/userController.js";
import {
  authenticateToken,
  requireAdmin,
  requireSelfOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Every route below requires a valid token. Applying it at the router level
// means a newly added route is protected by default rather than by remembering.
router.use(authenticateToken);

// Self-service routes: any authenticated user, acting only on their own record.
// These must stay above "/:id" so "me" is not parsed as an id.
router.get("/me", getCurrentUser);
router.put("/me", updateCurrentUser);

// Account administration is admin-only. Listing users exposes usernames,
// emails, roles and login times, so it is not a public read.
router.get("/", requireAdmin, getAllUsers);
router.get("/:id", requireAdmin, getUserById);
router.post("/", requireAdmin, validateUserCreation, createUser);
router.put("/:id", requireAdmin, validateUserUpdate, updateUser);
router.delete("/:id", requireAdmin, deleteUser);

// A user may rotate their own password; an admin may reset anyone's.
router.put(
  "/:id/password",
  requireSelfOrAdmin,
  validatePasswordChange,
  changePassword
);

export default router;
