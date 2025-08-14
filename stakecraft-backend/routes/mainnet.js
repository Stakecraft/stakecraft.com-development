import express from "express";
import {
  getMainnetList,
  createMainnetList,
  updateMainnetList,
  deleteMainnetList,
  updateMainnetPositions,
} from "../controllers/mainnetCtrl.js";

const router = express.Router();

router.post("/", createMainnetList);
router.get("/", getMainnetList);
router.put("/:id", updateMainnetList);
router.delete("/:id", deleteMainnetList);
router.put("/positions/update", updateMainnetPositions);

export default router;
