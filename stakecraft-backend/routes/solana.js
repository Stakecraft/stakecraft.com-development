import express from "express";
import { getValidatorStats } from "../controllers/solanaCtrl.js";

const router = express.Router();

router.get("/validator-stats/:voteAccount", getValidatorStats);

export default router;
