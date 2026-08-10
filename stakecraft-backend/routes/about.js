import express from "express";
import {
  getAboutContent,
  createAboutContent,
  updateAboutContent,
  deleteAboutContent,
} from "../controllers/aboutCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

// Public read - the marketing site renders this section anonymously.
router.get("/", getAboutContent);

// Writes require an authenticated editor or admin.
const write = [authenticateToken, requireEditor];

router.post("/", ...write, sanitizeContent, createAboutContent);
router.put("/:id", ...write, sanitizeContent, updateAboutContent);
router.delete("/:id", ...write, deleteAboutContent);

export default router;
