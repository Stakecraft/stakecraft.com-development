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
} from "../controllers/userController.js";
import {
  authenticateToken,
  requireAdmin,
  requireEditor,
} from "../middleware/auth.js";

const router = express.Router();

// Public routes (for current user)
router.get("/me", getCurrentUser);
router.put("/me", updateCurrentUser);

// Admin only routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/password", changePassword);

export default router;
