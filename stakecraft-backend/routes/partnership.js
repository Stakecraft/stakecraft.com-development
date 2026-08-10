import express from "express";
import {
  getPartnershipList,
  createPartnershipList,
  updatePartnershipList,
  deletePartnershipList,
} from "../controllers/partnershipCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

// Public read - the marketing site renders this list anonymously.
router.get("/", getPartnershipList);

// Writes require an authenticated editor or admin.
const write = [authenticateToken, requireEditor];

router.post("/", ...write, sanitizeContent, createPartnershipList);
router.put("/:id", ...write, sanitizeContent, updatePartnershipList);
router.delete("/:id", ...write, deletePartnershipList);

export default router;
