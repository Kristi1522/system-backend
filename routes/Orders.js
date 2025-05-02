const express = require("express");
const Order = require("../models/order");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// 🔹 Krijimi i porosisë
router.post("/", protect, async (req, res) => {
  const { items, totalPrice } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Asnjë artikull në porosi." });
  }

  try {
    const newOrder = await Order.create({
      user: req.user._id,
      items,
      totalPrice,
      shiftClosed: false,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Gabim gjatë krijimit të porosisë:", err.message);
    res.status(500).json({ message: "Gabim gjatë krijimit të porosisë" });
  }
});

// 🔹 Merr të gjitha porositë për sot, për të gjithë user-at
router.get("/my", protect, async (req, res) => {
  try {
    const sot = new Date();
    sot.setHours(0, 0, 0, 0);
    const neser = new Date(sot);
    neser.setDate(neser.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: sot, $lt: neser },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së porosive:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së porosive" });
  }
});

// 🔹 Mbyll turnin për userin e loguar
router.put("/close-shift", protect, async (req, res) => {
  try {
    const sot = new Date();
    sot.setHours(0, 0, 0, 0);
    const neser = new Date(sot);
    neser.setDate(neser.getDate() + 1);

    const updated = await Order.updateMany(
      {
        user: req.user._id,
        createdAt: { $gte: sot, $lt: neser },
        shiftClosed: false,
      },
      { $set: { shiftClosed: true } }
    );

    res.json({ message: "✅ Turni u mbyll me sukses", updatedCount: updated.modifiedCount });
  } catch (err) {
    console.error("❌ Gabim gjatë mbylljes së turnit:", err.message);
    res.status(500).json({ message: "Gabim gjatë mbylljes së turnit." });
  }
});

// 🔹 Porositë për adminin
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.dishId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së të gjitha porosive:", err.message);
    res.status(500).json({ message: "Gabim gjatë marrjes së porosive" });
  }
});

// 🔹 Përmbledhje e porosive – vetëm për admin
router.get("/summary", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("user");

    const totalOrders = orders.length;
    const totalIncome = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      totalOrders,
      totalIncome,
      orders: orders.map((order) => ({
        _id: order._id,
        total: order.totalPrice,
        userEmail: order.user?.email || "I panjohur",
        createdAt: order.createdAt,
      })),
    });
  } catch (err) {
    console.error("❌ Gabim në /orders/summary:", err.message);
    res.status(500).json({ message: "Gabim gjatë përmbledhjes" });
  }
});

// 🔹 Përmbledhje ditore – për grafik
router.get("/daily-summary", protect, adminOnly, async (req, res) => {
  try {
    const sot = new Date();
    sot.setHours(0, 0, 0, 0);

    const neser = new Date(sot);
    neser.setDate(sot.getDate() + 1);

    const ordersToday = await Order.find({
      createdAt: { $gte: sot, $lt: neser },
    }).populate("user");

    const summary = {};

    ordersToday.forEach((order) => {
      const email = order.user?.email || "I panjohur";
      if (!summary[email]) {
        summary[email] = { total: 0, count: 0 };
      }
      summary[email].total += order.totalPrice;
      summary[email].count++;
    });

    res.json(
      Object.entries(summary).map(([email, data]) => ({
        email,
        total: data.total,
        count: data.count,
      }))
    );
  } catch (err) {
    console.error("❌ Gabim në /orders/daily-summary:", err.message);
    res.status(500).json({ message: "Gabim gjatë përmbledhjes ditore" });
  }
});

// 🔹 Përmbledhje sipas datës – për grafik
router.get("/revenue-by-date", protect, adminOnly, async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("❌ Gabim në /orders/revenue-by-date:", err.message);
    res.status(500).json({ message: "Gabim gjatë përmbledhjes sipas datës" });
  }
});

// 🔹 Fshi një porosi – vetëm për admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Porosia nuk u gjet." });
    }

    await order.deleteOne();

    res.json({ message: "✅ Porosia u fshi me sukses." });
  } catch (err) {
    console.error("❌ Gabim gjatë fshirjes së porosisë:", err.message);
    res.status(500).json({ message: "Gabim gjatë fshirjes së porosisë." });
  }
});

module.exports = router;
