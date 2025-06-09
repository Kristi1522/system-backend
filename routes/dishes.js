const express = require("express");
const Dish = require("../models/Dish");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Merr të gjitha pjatat – për të gjithë përdoruesit e loguar
router.get("/", protect, async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së pjatave:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së menysë" });
  }
});

//  Shto një pjatë – vetëm admini
router.post("/", protect, adminOnly, async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  try {
    const newDish = new Dish({ name, description, price });
    await newDish.save();
    res.status(201).json({ message: "✅ Pjata u shtua me sukses!" });
  } catch (err) {
    console.error("❌ Gabim gjatë shtimit të pjatës:", err.message);
    res.status(500).json({ message: "Gabim gjatë shtimit të pjatës." });
  }
});

// Përditëso një pjatë – vetëm admini
router.put("/:id", protect, adminOnly, async (req, res) => {
  const { name, description, price } = req.body;

  try {
    const updatedDish = await Dish.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true }
    );

    if (!updatedDish) {
      return res.status(404).json({ message: "Pjata nuk u gjet." });
    }

    res.json({ message: "✅ Pjata u përditësua me sukses!", dish: updatedDish });
  } catch (err) {
    console.error("❌ Gabim gjatë përditësimit të pjatës:", err.message);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

//  Fshi një pjatë – vetëm admini
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deletedDish = await Dish.findByIdAndDelete(req.params.id);

    if (!deletedDish) {
      return res.status(404).json({ message: "Pjata nuk u gjet." });
    }

    res.json({ message: "✅ Pjata u fshi me sukses." });
  } catch (err) {
    console.error("❌ Gabim gjatë fshirjes së pjatës:", err.message);
    res.status(500).json({ message: "Gabim gjatë fshirjes." });
  }
});

module.exports = router;
