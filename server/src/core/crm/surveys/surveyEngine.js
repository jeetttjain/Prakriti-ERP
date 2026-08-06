const CustomerSurvey = require("../../../models/CustomerSurvey");
const SurveyResponse = require("../../../models/SurveyResponse");

class SurveyEngine {
  async listSurveys() {
    const count = await CustomerSurvey.countDocuments();
    if (count === 0) {
      await CustomerSurvey.create([
        { surveyId: "SRV-2026-01", title: "Post-Delivery Quality & Satisfaction Survey", type: "CSAT", status: "Active" },
      ]);
    }
    return CustomerSurvey.find({}).sort({ createdAt: -1 });
  }

  async recordResponse(surveyId, customerCode, rating, feedbackText = "Very satisfied") {
    const responseId = `RSP-${Date.now()}`;
    return SurveyResponse.create({
      responseId,
      surveyId,
      customerCode,
      rating,
      feedbackText,
    });
  }
}

module.exports = new SurveyEngine();
