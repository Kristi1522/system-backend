// backend/createEmployee.js
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://localhost:27017/project")
  .then(async () => {
    const email = "user1@example.com";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("⚠️ Përdoruesi ekziston tashmë.");
    } else {
      const employee = new User({
        email,
        password: "user123",
        role: "employee",
      });
      await employee.save();
      console.log("✅ Përdoruesi (employee) u krijua me sukses.");
    }
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Gabim në lidhje me MongoDB:", err);
  });
