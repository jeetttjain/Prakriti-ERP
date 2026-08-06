const FollowUp = require("../../../models/FollowUp");
const eventPublisher = require("../../events/eventPublisher");

class FollowupEngine {
  async listFollowups() {
    return FollowUp.find({}).sort({ dueDate: 1 });
  }

  async createFollowup(customerCode, type = "Call", dueDate = new Date(), notes = "Scheduled follow-up") {
    const followUpId = `FLP-${Date.now()}`;
    const flp = await FollowUp.create({
      followUpId,
      customerCode,
      type,
      dueDate: new Date(dueDate),
      notes,
      status: "Scheduled",
    });

    eventPublisher.publish("FOLLOWUP_CREATED", { followUpId, customerCode, type, dueDate }, { producerModule: "ECXP" }).catch(() => {});
    return flp;
  }
}

module.exports = new FollowupEngine();
