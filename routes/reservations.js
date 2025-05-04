const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const protect = require('../middleware/authMiddleware');

// Krijon një rezervim
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
      note
    });

    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: 'Gabim gjatë krijimit të rezervimit.' });
  }
});

// Merr rezervimet e përdoruesit
router.get('/my', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Gabim gjatë marrjes së rezervimeve.' });
  }
});

module.exports = router;
