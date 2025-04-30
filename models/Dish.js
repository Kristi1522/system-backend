const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true // për createdAt dhe updatedAt automatikisht
});

module.exports = mongoose.model("Dish", dishSchema);
