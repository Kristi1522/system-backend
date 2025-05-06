const express = require("express");
const Reservation = require("../models/Reservation");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/by-admin", protect, adminOnly, async (req, res) => {
  const { userId, date, time, peopleCount } = req.body;

  if (!userId || !date || !time || !peopleCount) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  try {
    const newReservation = await Reservation.create({
      user: userId,
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

module.exports = router;
