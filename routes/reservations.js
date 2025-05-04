const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const protect = require("../middleware/authMiddleware");

// POST /api/reservations – Krijo një rezervim
router.post("/", protect, async (req, res) => {
  const { date, people, note } = req.body;

  if (!date || !people) {
    return res.status(400).json({ message: "Data dhe numri i personave janë të detyrueshme." });
  }

  try {
    const newReservation = await Reservation.create({
      user: req.user._id,
      date,
      people,
      note,
    });

    res.status(201).json(newReservation);
  } catch (err) {
    console.error("❌ Gabim gjatë shtimit të rezervimit:", err.message);
    res.status(500).json({ message: "Gabim gjatë shtimit të rezervimit." });
  }
});

// GET /api/reservations/my – Merr rezervimet e përdoruesit të loguar
router.get("/my", protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së rezervimeve:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së rezervimeve." });
  }
});

module.exports = router;
