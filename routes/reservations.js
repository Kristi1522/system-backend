const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const protect = require('../middleware/authMiddleware');

// POST - krijo rezervim të ri
router.post('/', protect, async (req, res) => {
  const { date, people, note } = req.body;

  if (!date || !people) {
    return res.status(400).json({ message: 'Plotëso të gjitha fushat.' });
  }

  try {
    const reservation = await Reservation.create({
      user: req.user._id,
      date,
      people,
      note,
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error('Gabim te POST /reservations:', err.message);
    res.status(500).json({ message: 'Gabim gjatë krijimit të rezervimit.' });
  }
});

// GET - rezervimet e përdoruesit
router.get('/my', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reservations); // 🔥 KTHE VETËM ARRAY
  } catch (err) {
    console.error('Gabim te GET /reservations/my:', err.message);
    res.status(500).json({ message: 'Gabim gjatë marrjes së rezervimeve.' });
  }
});

module.exports = router;
