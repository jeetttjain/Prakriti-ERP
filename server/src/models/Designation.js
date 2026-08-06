const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    designationCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Designation", designationSchema);
