import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTeamMembers);
router.post("/", authenticateToken, requireEditor, createTeamMember);
router.put("/:id", authenticateToken, requireEditor, updateTeamMember);
router.delete("/:id", authenticateToken, requireEditor, deleteTeamMember);

export default router;
