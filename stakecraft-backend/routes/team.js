import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamCtrl.js";

const router = express.Router();

router.post("/", createTeamMember);
router.get("/", getTeamMembers);
router.put("/:id", updateTeamMember);
router.delete("/:id", deleteTeamMember);

export default router;
