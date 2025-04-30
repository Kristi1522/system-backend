// backend/createAdmin.js
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://localhost:27017/project")
  .then(async () => {
    const email = "a@a.com";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("⚠️ Admin ekziston tashmë.");
    } else {
      const admin = new User({
        email,
        password: "admin123",
        role: "admin",
      });
      await admin.save();
      console.log("✅ Admin u krijua me sukses.");
    }
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Gabim në lidhje me MongoDB:", err);
  });
