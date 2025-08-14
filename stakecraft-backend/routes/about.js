import express from "express";
import {
  getAboutContent,
  createAboutContent,
  updateAboutContent,
  deleteAboutContent,
} from "../controllers/aboutCtrl.js";

const router = express.Router();

router.post("/", createAboutContent);
router.get("/", getAboutContent);
router.put("/:id", updateAboutContent);
router.delete("/:id", deleteAboutContent);

export default router;
