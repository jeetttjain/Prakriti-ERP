const mongoose = require("mongoose");

const customerSurveySchema = new mongoose.Schema(
  {
    surveyId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["CSAT", "NPS", "CES"], default: "CSAT" },
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerSurvey", customerSurveySchema);
