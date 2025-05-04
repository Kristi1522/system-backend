const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const protect = require('../middleware/authMiddleware'); // middleware për autentikim

// GET /api/reservations/my - Merr rezervimet e përdoruesit të loguar
router.get('/my', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    console.error('Gabim gjatë marrjes së rezervimeve:', err.message);
    res.status(500).json({ message: 'Gabim gjatë marrjes së rezervimeve.' });
  }
});

// POST /api/reservations - Shto një rezervim të ri
router.post('/', protect, async (req, res) => {
  const { date, people, note } = req.body;

  if (!date || !people) {
    return res.status(400).json({ message: 'Plotëso datën dhe numrin e personave.' });
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
    console.error('Gabim gjatë krijimit të rezervimit:', err.message);
    res.status(500).json({ message: 'Gabim gjatë krijimit të rezervimit.' });
  }
});

module.exports = router;
