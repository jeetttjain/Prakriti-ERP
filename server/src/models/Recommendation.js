const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    recId: { type: String },
    customerCode: { type: String, required: true, unique: true },
    recommendedProducts: [
      {
        productCode: { type: String, required: true },
        reason: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
