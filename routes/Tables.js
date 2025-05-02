const express = require("express");
const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET all tables
router.get("/", protect, async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

// CREATE table (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  const { number, capacity } = req.body;
  const table = new Table({ number, capacity });
  await table.save();
  res.status(201).json(table);
});

// CREATE reservation
router.post("/reserve", protect, async (req, res) => {
  const { tableId, customerName, time } = req.body;
  const table = await Table.findById(tableId);

  if (!table || table.status !== "available") {
    return res.status(400).json({ message: "Table not available." });
  }

  table.status = "reserved";
  await table.save();

  const reservation = new Reservation({
    table: table._id,
    customerName,
    time,
    createdBy: req.user._id,
  });
  await reservation.save();

  res.status(201).json(reservation);
});

module.exports = router;