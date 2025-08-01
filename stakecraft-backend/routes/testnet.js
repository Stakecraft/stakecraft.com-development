import express from "express";
import {
  getTestnetList,
  createTestnetList,
  updateTestnetList,
  deleteTestnetList,
} from "../controllers/testnetCtrl.js";

const router = express.Router();

router.post("/", createTestnetList);
router.get("/", getTestnetList);
router.put("/:id", updateTestnetList);
router.delete("/:id", deleteTestnetList);

export default router;
