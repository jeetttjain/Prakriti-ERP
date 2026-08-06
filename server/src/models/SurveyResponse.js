const mongoose = require("mongoose");

const surveyResponseSchema = new mongoose.Schema(
  {
    responseId: { type: String, required: true, unique: true },
    surveyId: { type: String, required: true, index: true },
    customerCode: { type: String, required: true, index: true },
    rating: { type: Number, required: true }, // 1 to 5 for CSAT, 1 to 10 for NPS
    feedbackText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SurveyResponse", surveyResponseSchema);
