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
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
]);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Derive the extension from an allow-list rather than from the client's
    // filename, so "shell.php" or "x.html" cannot be written to disk.
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : ".bin";
    cb(null, `${file.fieldname}-${uniqueSuffix}${safeExt}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // The declared mimetype comes from the client, so the extension must agree
    // with it. SVG is excluded: it renders as an image but can execute script.
    const ext = path.extname(file.originalname || "").toLowerCase();
    const mimeOk =
      file.mimetype.startsWith("image/") && file.mimetype !== "image/svg+xml";

    if (mimeOk && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    return cb(new Error("Only PNG, JPEG, GIF, WEBP or BMP images are allowed"), false);
  },
});

// Public reads. The marketing site fetches these anonymously, so they stay
// open, but they only ever return published content - never user records.
router.get("/", getAllContent);
router.get("/stats", getContentStats);
router.get("/:type", getContentByType);
router.get("/:type/:id", getContentById);

// Every mutation requires an authenticated editor or admin.
// This is the gap behind the unauthenticated CMS defacement finding.
router.post(
  "/:type",
  authenticateToken,
  requireEditor,
  upload.single("image"),
  sanitizeContent,
  validateContentCreation,
  createContent
);
router.put(
  "/:type/:id",
  authenticateToken,
  requireEditor,
  upload.single("image"),
  sanitizeContent,
  validateContentUpdate,
  updateContent
);
router.delete("/:type/:id", authenticateToken, requireEditor, deleteContent);
router.patch("/:type/reorder", authenticateToken, requireEditor, reorderContent);
router.post("/:type/bulk", authenticateToken, requireEditor, bulkOperation);

export default router;
