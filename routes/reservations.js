const express = require("express");
const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// 🔹 Krijim rezervimi nga admini
router.post("/by-admin", protect, adminOnly, async (req, res) => {
  const { userId, date, time, peopleCount } = req.body;

  if (!userId || !date || !time || !peopleCount) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  try {
    const newReservation = await Reservation.create({
      user: new mongoose.Types.ObjectId(userId),
      date,
      time,
      peopleCount,
      status: "active",
    });

    res.status(201).json(newReservation);
  } catch (err) {
    console.error("❌ Gabim gjatë krijimit të rezervimit nga admini:", err.message);
    res.status(500).json({ message: "Gabim gjatë krijimit të rezervimit." });
  }
});

// 🔹 Merr të gjitha rezervimet (vetëm admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user")
      .sort({ date: -1 });

    res.json(reservations);
  } catch (err) {
    console.error("Gabim gjatë marrjes së rezervimeve:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së rezervimeve" });
  }
});

// 🔹 Merr rezervimet e përdoruesit të loguar
router.get("/my", protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    console.error("Gabim gjatë marrjes së rezervimeve të mia:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së rezervimeve" });
  }
});

// 🔴 Fshi rezervim (vetëm admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Rezervimi nuk u gjet." });
    }

    await reservation.deleteOne();
    res.json({ message: "✅ Rezervimi u fshi me sukses." });
  } catch (err) {
    console.error("❌ Gabim gjatë fshirjes së rezervimit:", err.message);
    res.status(500).json({ message: "Gabim gjatë fshirjes së rezervimit." });
  }
});

module.exports = router;
