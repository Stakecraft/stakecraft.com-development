import express from "express";
import {
  getAboutContent,
  createAboutContent,
  updateAboutContent,
  deleteAboutContent,
} from "../controllers/aboutCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAboutContent);
router.post("/", authenticateToken, requireEditor, createAboutContent);
router.put("/:id", authenticateToken, requireEditor, updateAboutContent);
router.delete("/:id", authenticateToken, requireEditor, deleteAboutContent);

export default router;
