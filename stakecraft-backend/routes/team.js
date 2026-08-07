import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

// Public read - the marketing site renders the team list anonymously.
router.get("/", getTeamMembers);

// Writes require an authenticated editor or admin.
const write = [authenticateToken, requireEditor];

router.post("/", ...write, sanitizeContent, createTeamMember);
router.put("/:id", ...write, sanitizeContent, updateTeamMember);
router.delete("/:id", ...write, deleteTeamMember);

export default router;
