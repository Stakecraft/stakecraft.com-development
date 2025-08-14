import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllContent,
  getContentByType,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  reorderContent,
  bulkOperation,
  getContentStats,
  validateContentCreation,
  validateContentUpdate,
} from "../controllers/contentController.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Public routes (no authentication required)
router.get("/", getAllContent);
router.get("/stats", getContentStats);
router.get("/:type", getContentByType);
router.get("/:type/:id", getContentById);

// Protected routes (temporarily without authentication for menu management)
router.post(
  "/:type",
  upload.single("image"),
  validateContentCreation,
  createContent
);
router.put(
  "/:type/:id",
  upload.single("image"),
  validateContentUpdate,
  updateContent
);
router.delete("/:type/:id", deleteContent);
router.patch("/:type/reorder", reorderContent);
router.post("/:type/bulk", bulkOperation);

export default router;
