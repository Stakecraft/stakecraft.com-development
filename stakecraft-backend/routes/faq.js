import express from "express";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faqCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

router.get("/", getFaqs);
router.post("/", authenticateToken, requireEditor, sanitizeContent, createFaq);
router.put("/:id", authenticateToken, requireEditor, sanitizeContent, updateFaq);
router.delete("/:id", authenticateToken, requireEditor, deleteFaq);

export default router;
