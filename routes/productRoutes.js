const express = require("express");
const {
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductById,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", fetchAllProducts);
router.get("/:id", fetchProductById);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
