import express from "express";
import {
  getTestnetList,
  createTestnetList,
  updateTestnetList,
  deleteTestnetList,
  updateTestnetPositions,
  migrateToMainnet,
} from "../controllers/testnetCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTestnetList);
router.post("/", authenticateToken, requireEditor, createTestnetList);
router.put("/:id", authenticateToken, requireEditor, updateTestnetList);
router.delete("/:id", authenticateToken, requireEditor, deleteTestnetList);
router.put("/positions/update", authenticateToken, requireEditor, updateTestnetPositions);
router.post("/migrate-to-mainnet", authenticateToken, requireEditor, migrateToMainnet);

export default router;
