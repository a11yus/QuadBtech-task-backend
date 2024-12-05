const express = require("express");
const {
  fetchCartByUser,
  addToCart,
  removeFromCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, fetchCartByUser);
router.post("/", protect, addToCart);
router.delete("/:id", removeFromCart);

module.exports = router;
