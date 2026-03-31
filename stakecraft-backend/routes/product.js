import express from "express";
import {
  getProductList,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productCtrl.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProductList);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
