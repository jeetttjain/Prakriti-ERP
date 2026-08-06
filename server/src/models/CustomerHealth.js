const mongoose = require("mongoose");

const customerHealthSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    healthScore: { type: Number, default: 85 }, // 0 to 100
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    factors: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerHealth", customerHealthSchema);
