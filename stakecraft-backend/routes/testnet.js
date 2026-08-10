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
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

// Public read - the marketing site renders this list anonymously.
router.get("/", getTestnetList);

// Writes require an authenticated editor or admin.
const write = [authenticateToken, requireEditor];

router.post("/", ...write, sanitizeContent, createTestnetList);
router.put("/:id", ...write, sanitizeContent, updateTestnetList);
router.delete("/:id", ...write, deleteTestnetList);
router.put("/positions/update", ...write, updateTestnetPositions);
router.post("/migrate-to-mainnet", ...write, migrateToMainnet);

export default router;
