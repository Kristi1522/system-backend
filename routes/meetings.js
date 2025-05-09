const express = require("express");
const mongoose = require("mongoose");
const Meeting = require("../models/Meeting");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// 🔸 Krijim takimi nga admini
router.post("/by-admin", protect, adminOnly, async (req, res) => {
  const { userId, date, hour, topic } = req.body;

  if (!userId || !date || !hour || !topic) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  try {
    const newMeeting = await Meeting.create({
      user: new mongoose.Types.ObjectId(userId),
      date,
      hour,
      topic,
      status: "active",
    });

    res.status(201).json(newMeeting);
  } catch (err) {
    console.error("❌ Gabim gjatë krijimit të takimit:", err.message);
    res.status(500).json({ message: "Gabim gjatë krijimit të takimit." });
  }
});

// 🔸 Merr të gjitha takimet (vetëm admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const meetings = await Meeting.find().populate("user").sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së takimeve" });
  }
});

// 🔸 Merr takimet e user-it
router.get("/my", protect, async (req, res) => {
  try {
    const meetings = await Meeting.find({ user: req.user._id }).sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së takimeve të mia" });
  }
});

// 🔸 Fshi takim (vetëm admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Takimi nuk u gjet." });

    await meeting.deleteOne();
    res.json({ message: "Takimi u fshi me sukses." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë fshirjes së takimit." });
  }
});

module.exports = router;
