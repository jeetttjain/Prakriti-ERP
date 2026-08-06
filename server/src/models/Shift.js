const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    shiftId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "18:00" },
    graceMins: { type: Number, default: 15 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
