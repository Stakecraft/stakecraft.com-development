import express from "express";
import {
  getPartnershipList,
  createPartnershipList,
  updatePartnershipList,
  deletePartnershipList,
} from "../controllers/partnershipCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPartnershipList);
router.post("/", authenticateToken, requireEditor, createPartnershipList);
router.put("/:id", authenticateToken, requireEditor, updatePartnershipList);
router.delete("/:id", authenticateToken, requireEditor, deletePartnershipList);

export default router;
