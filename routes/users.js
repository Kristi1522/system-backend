const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Merr të gjithë përdoruesit (vetëm për admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("_id email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Gabim në marrjen e përdoruesve" });
  }
});

module.exports = router;
