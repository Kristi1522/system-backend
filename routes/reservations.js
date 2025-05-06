const express = require("express");
const Reservation = require("../models/Reservation");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// 🔹 Krijo rezervim të ri
router.post("/", protect, async (req, res) => {
  const { date, time, peopleCount } = req.body;

  if (!date || !time || !peopleCount) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  try {
    const newReservation = await Reservation.create({
      user: req.user._id,
      date,
      time,
      peopleCount,
    });

    res.status(201).json(newReservation);
  } catch (err) {
    console.error("❌ Gabim gjatë krijimit të rezervimit:", err.message);
    res.status(500).json({ message: "Gabim gjatë krijimit të rezervimit." });
  }
});

// 🔹 Lista e rezervimeve të përdoruesit
router.get("/my", protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së rezervimeve:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së rezervimeve." });
  }
});

// 🔹 Lista e të gjitha rezervimeve – admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("user").sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së të gjitha rezervimeve:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së rezervimeve." });
  }
});

// 🔹 Anulo rezervim – përdoruesi vetë ose admini
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Rezervimi nuk u gjet." });
    }

    // Vetëm përdoruesi që ka bërë rezervimin ose admini mund ta anulojë
    if (
      reservation.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Nuk ke të drejtë të anulosh këtë rezervim." });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.json({ message: "Rezervimi u anulua me sukses." });
  } catch (err) {
    console.error("❌ Gabim gjatë anulimit të rezervimit:", err.message);
    res.status(500).json({ message: "Gabim gjatë anulimit të rezervimit." });
  }
});

module.exports = router;
