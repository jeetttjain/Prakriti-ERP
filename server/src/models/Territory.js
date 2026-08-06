const mongoose = require("mongoose");

const territorySchema = new mongoose.Schema(
  {
    territoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    region: { type: String, default: "North" },
    assignedManagerCode: { type: String, default: "EMP-001" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Territory", territorySchema);
