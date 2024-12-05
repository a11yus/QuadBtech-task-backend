const express = require("express");
const { fetchUserById } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, fetchUserById);

module.exports = router;
