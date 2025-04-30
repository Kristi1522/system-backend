const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  res.json({
    email: req.user.email,
    role: req.user.role, // opsional
  });
});

module.exports = router;
