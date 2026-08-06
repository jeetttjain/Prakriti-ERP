const CustomerActivity = require("../../../models/CustomerActivity");
const CustomerTimeline = require("../../../models/CustomerTimeline");

class ActivityEngine {
  /**
   * Centralized CRM activity logger and source of truth for timelines.
   */
  async logActivity(customerCode, type, title, details = {}, userCode = "SALES-EXEC-01") {
    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const activity = await CustomerActivity.create({
      activityId,
      customerCode,
      type,
      title,
      details,
      userCode,
    });

    // Mirror entry into CustomerTimeline for chronological views
    await CustomerTimeline.create({
      timelineId: `TL-${Date.now()}`,
      customerCode,
      type,
      description: `${title} - ${typeof details === "string" ? details : JSON.stringify(details)}`,
      userCode,
    }).catch(() => {});

    return activity;
  }

  async getActivitiesForCustomer(customerCode) {
    return CustomerActivity.find({ customerCode }).sort({ createdAt: -1 });
  }
}

module.exports = new ActivityEngine();
