import express from "express";
import {
  getPartnershipList,
  createPartnershipList,
  updatePartnershipList,
  deletePartnershipList,
} from "../controllers/partnershipCtrl.js";

const router = express.Router();

router.post("/", createPartnershipList);
router.get("/", getPartnershipList);
router.put("/:id", updatePartnershipList);
router.delete("/:id", deletePartnershipList);

export default router;
