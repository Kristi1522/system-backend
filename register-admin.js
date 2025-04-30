const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Lidhja me MongoDB OK");

    const email = "admin@example.com";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin ekziston tashmë në databazë.");
      return process.exit();
    }

    const admin = new User({
      email,
      password: "admin123", // kjo do hash-ohet automatikisht nga User.js
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin u krijua me sukses: admin@example.com / admin123");

    process.exit();
  } catch (err) {
    console.error("❌ Gabim:", err);
    process.exit(1);
  }
}

createAdmin();
