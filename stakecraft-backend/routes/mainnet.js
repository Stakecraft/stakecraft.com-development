import express from "express";
import {
  getMainnetList,
  createMainnetList,
  updateMainnetList,
  deleteMainnetList,
} from "../controllers/mainnetCtrl.js";

const router = express.Router();

router.post("/", createMainnetList);
router.get("/", getMainnetList);
router.put("/:id", updateMainnetList);
router.delete("/:id", deleteMainnetList);

export default router;
