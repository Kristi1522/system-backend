const reservationSchema = new mongoose.Schema({
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    customerName: String,
    time: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  });
  
  module.exports = mongoose.model("Reservation", reservationSchema);
  