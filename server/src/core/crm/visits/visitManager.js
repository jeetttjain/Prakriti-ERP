const SalesVisit = require("../../../models/SalesVisit");
const activityEngine = require("../activities/activityEngine");
const eventPublisher = require("../../events/eventPublisher");

class VisitManager {
  async initializeDefaults() {
    const count = await SalesVisit.countDocuments();
    if (count > 0) return;

    await SalesVisit.create([
      { visitId: "VST-701", customerCode: "CUST-B2B-01", executiveCode: "SALES-EXEC-01", notes: "Discussed Q4 bulk ordering and cold-pressed mustard oil stock availability.", outcome: "OrderPlaced", status: "Completed" },
    ]);
  }

  async listVisits() {
    await this.initializeDefaults();
    return SalesVisit.find({}).sort({ createdAt: -1 });
  }

  async logVisit(customerCode, executiveCode = "SALES-EXEC-01", notes = "Field Sales Visit", outcome = "Completed") {
    const visitId = `VST-${Date.now().toString().slice(-4)}`;
    const visit = await SalesVisit.create({
      visitId,
      customerCode,
      executiveCode,
      notes,
      outcome,
      status: "Completed",
    });

    await activityEngine.logActivity(customerCode, "Visit", `Sales Visit Logged by ${executiveCode}`, { outcome, notes });
    eventPublisher.publish("CUSTOMER_VISIT", { visitId, customerCode, executiveCode, outcome }, { producerModule: "ECXP" }).catch(() => {});

    return visit;
  }
}

module.exports = new VisitManager();
