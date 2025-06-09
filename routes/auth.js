const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Po provohet login me:", email, password);

  try {
    const user = await User.findOne({ email });
    console.log("📂 Gjetëm përdoruesin:", user);

    if (user && (await user.matchPassword(password))) {
      console.log("✅ Password përputhet");

      // Token 
      const token = jwt.sign({ id: user._id }, "jwt_secret_key"); 

      return res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      console.log("❌ Email ose password i pasaktë");
      return res.status(401).json({ message: "Email ose password i pasaktë" });
    }
  } catch (err) {
    console.error("❌ Gabim gjatë login:", err);
    res.status(500).json({ message: "Gabim serveri" });
  }
});

//  REGISTER – vetëm nga admini i loguar
router.post("/register", protect, async (req, res) => {
  const { email, password, role } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Vetëm admini mund të regjistrojë përdorues" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Përdoruesi ekziston" });
    }

    const newUser = new User({ email, password, role });
    await newUser.save();

    res.status(201).json({ message: "Përdoruesi u krijua me sukses" });
  } catch (err) {
    console.error("❌ Gabim në regjistrim:", err);
    res.status(500).json({ message: "Gabim gjatë regjistrimit" });
  }
});

module.exports = router;
