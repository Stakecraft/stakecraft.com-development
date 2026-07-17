import express from "express";
import {
  getMainnetList,
  createMainnetList,
  updateMainnetList,
  deleteMainnetList,
  updateMainnetPositions,
  migrateToTestnet,
} from "../controllers/mainnetCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getMainnetList);
router.post("/", authenticateToken, requireEditor, createMainnetList);
router.put("/:id", authenticateToken, requireEditor, updateMainnetList);
router.delete("/:id", authenticateToken, requireEditor, deleteMainnetList);
router.put("/positions/update", authenticateToken, requireEditor, updateMainnetPositions);
router.post("/migrate-to-testnet", authenticateToken, requireEditor, migrateToTestnet);

export default router;
