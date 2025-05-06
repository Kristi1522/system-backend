const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Ngarkon .env variablat

// Modelet
const User = require("./models/User");
const Dish = require("./models/Dish");

// Rrugët
const authRoutes = require("./routes/auth");
const dishRoutes = require("./routes/dishes");
const orderRoutes = require("./routes/Orders");
const profileRoutes = require("./routes/profile");
const reservationRoutes = require("./routes/reservations");

const app = express();

// ✅ Aktivizo CORS për frontend-in në Vercel
app.use(cors({
  origin: "https://system-gamma-silk.vercel.app",
  credentials: true
}));

// ✅ Middleware për JSON parsing
app.use(express.json());

// ✅ Rrugët e API-së
app.use("/auth", authRoutes);
app.use("/dishes", dishRoutes);
app.use("/orders", orderRoutes);
app.use("/profile", profileRoutes);
app.use("/api/reservations", reservationRoutes);

// 🔧 Endpoint testues për të krijuar një admin default
app.get("/seed-admin", async (req, res) => {
  try {
    const exists = await User.findOne({ email: "admin@example.com" });
    if (exists) return res.send("⚠️ Admin ekziston tashmë.");

    const admin = new User({
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    await admin.save();
    res.send("✅ Admin u krijua me sukses: admin@example.com / admin123");
  } catch (err) {
    console.error("❌ Gabim gjatë krijimit të admin:", err.message);
    res.status(500).send("Gabim gjatë krijimit të admin.");
  }
});

// 🔍 Endpoint debug për pjatat
app.get("/debug-dishes", async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    console.error("❌ Gabim në /debug-dishes:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së pjatave" });
  }
});

// 🔁 Endpoint bazë
app.get("/", (req, res) => {
  res.send("🚀 Backend REST API i sistemit të restorantit po funksionon!");
});

// ▶️ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveri po dëgjon në portën ${PORT}`);
});
