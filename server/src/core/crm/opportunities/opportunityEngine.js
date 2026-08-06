const Opportunity = require("../../../models/Opportunity");
const activityEngine = require("../activities/activityEngine");
const eventPublisher = require("../../events/eventPublisher");

class OpportunityEngine {
  async initializeDefaults() {
    const count = await Opportunity.countDocuments();
    if (count > 0) return;

    await Opportunity.create([
      { opportunityId: "OPP-501", customerCode: "CUST-B2B-01", title: "Annual Cold-Pressed Oil Supply Contract", stage: "Proposal", probabilityPct: 80, expectedRevenue: 450000 },
    ]);
  }

  async listOpportunities() {
    await this.initializeDefaults();
    return Opportunity.find({}).sort({ createdAt: -1 });
  }

  async createOpportunity(data) {
    const opportunityId = `OPP-${Date.now().toString().slice(-4)}`;
    const opp = await Opportunity.create({ opportunityId, ...data });

    await activityEngine.logActivity(data.customerCode, "Meeting", `Opportunity Created: ${data.title}`, { expectedRevenue: data.expectedRevenue });
    eventPublisher.publish("OPPORTUNITY_CREATED", { opportunityId: opp.opportunityId, title: opp.title, revenue: opp.expectedRevenue }, { producerModule: "ECXP" }).catch(() => {});

    return opp;
  }
}

module.exports = new OpportunityEngine();
