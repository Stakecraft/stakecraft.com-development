import express from "express";
import {
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productCtrl.js";
import { authenticateToken, requireEditor } from "../middleware/auth.js";
import { sanitizeContent } from "../middleware/sanitize.js";

const router = express.Router();

// Public read - the marketing site renders the product list anonymously.
router.get("/", getProductList);

// Writes require an authenticated editor or admin.
const write = [authenticateToken, requireEditor];

router.post("/", ...write, sanitizeContent, createProduct);
router.put("/:id", ...write, sanitizeContent, updateProduct);
router.delete("/:id", ...write, deleteProduct);

export default router;
