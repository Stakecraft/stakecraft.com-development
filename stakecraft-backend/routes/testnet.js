import express from "express";
import {
  getTestnetList,
  createTestnetList,
  updateTestnetList,
  deleteTestnetList,
  updateTestnetPositions,
  migrateToMainnet,
} from "../controllers/testnetCtrl.js";

const router = express.Router();

router.post("/", createTestnetList);
router.get("/", getTestnetList);
router.put("/:id", updateTestnetList);
router.delete("/:id", deleteTestnetList);
router.put("/positions/update", updateTestnetPositions);
router.post("/migrate-to-mainnet", migrateToMainnet);

export default router;
