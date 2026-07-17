import express from "express";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faqCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getFaqs);
router.post("/", authenticateToken, requireEditor, createFaq);
router.put("/:id", authenticateToken, requireEditor, updateFaq);
router.delete("/:id", authenticateToken, requireEditor, deleteFaq);

export default router;
