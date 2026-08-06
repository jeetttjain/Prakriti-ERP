const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
  {
    reviewId: { type: String, required: true, unique: true },
    employeeCode: { type: String, required: true, index: true },
    period: { type: String, default: "2026-Q3" },
    ratingScore: { type: Number, required: true }, // 1.0 to 5.0
    feedback: { type: String },
    reviewerCode: { type: String, default: "MANAGER-01" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
