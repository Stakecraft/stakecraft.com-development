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
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

// Public read - the marketing site renders this list anonymously.
router.get("/", getMainnetList);

// Writes require an authenticated editor or admin.
const write = [authenticateToken, requireEditor];

router.post("/", ...write, sanitizeContent, createMainnetList);
router.put("/:id", ...write, sanitizeContent, updateMainnetList);
router.delete("/:id", ...write, deleteMainnetList);
router.put("/positions/update", ...write, updateMainnetPositions);
router.post("/migrate-to-testnet", ...write, migrateToTestnet);

export default router;
