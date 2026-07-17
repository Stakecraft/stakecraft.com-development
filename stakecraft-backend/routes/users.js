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
} from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authenticateToken, getCurrentUser);
router.put("/me", authenticateToken, updateCurrentUser);

router.get("/", authenticateToken, requireAdmin, getAllUsers);
router.get("/:id", authenticateToken, requireAdmin, getUserById);
router.post("/", authenticateToken, requireAdmin, validateUserCreation, createUser);
router.put("/:id", authenticateToken, requireAdmin, validateUserUpdate, updateUser);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);
router.put("/:id/password", authenticateToken, requireAdmin, changePassword);

export default router;
