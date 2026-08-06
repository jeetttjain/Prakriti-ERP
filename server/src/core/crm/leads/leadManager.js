const mongoose = require("mongoose");
const Lead = require("../../../models/Lead");
const leadAssignmentEngine = require("./leadAssignmentEngine");
const customerManager = require("../customers/customerManager");
const eventPublisher = require("../../events/eventPublisher");

class LeadManager {
  async initializeDefaults() {
    const count = await Lead.countDocuments();
    if (count > 0) return;

    await Lead.create([
      { leadId: "LEAD-101", companyName: "Rajasthan Retail Foods", contactName: "Suresh Patel", email: "suresh@rajfoods.com", phone: "+919829077777", leadSource: "Website", leadScore: 82, confidenceScore: 90, scoringFactors: ["High Engagement", "Verified GSTIN"], status: "New", assignedExecutiveCode: "SALES-EXEC-01" },
      { leadId: "LEAD-102", companyName: "Delhi Supermarket Corp", contactName: "Vikram Malhotra", email: "vikram@delhisuper.org", phone: "+919829088888", leadSource: "Campaign", leadScore: 65, confidenceScore: 80, scoringFactors: ["Campaign Click", "Phone Inquiry"], status: "Qualified", assignedExecutiveCode: "SALES-EXEC-02" },
    ]);
  }

  async listLeads() {
    await this.initializeDefaults();
    return Lead.find({}).sort({ createdAt: -1 });
  }

  async createLead(data) {
    const leadId = `LEAD-${Date.now().toString().slice(-4)}`;
    const lead = await Lead.create({ leadId, ...data });

    await leadAssignmentEngine.assignLead(lead.leadId, "RoundRobin", data.assignedExecutiveCode || "SALES-EXEC-01").catch(() => {});
    eventPublisher.publish("LEAD_CREATED", { leadId: lead.leadId, companyName: lead.companyName }, { producerModule: "ECXP" }).catch(() => {});

    return lead;
  }

  async convertLead(leadId) {
    const query = mongoose.Types.ObjectId.isValid(leadId) ? { $or: [{ _id: leadId }, { leadId }] } : { leadId };
    const lead = await Lead.findOne(query);
    if (!lead) throw new Error(`Lead ${leadId} not found.`);

    lead.status = "Converted";
    await lead.save();

    const customer = await customerManager.createCustomer({
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      segment: "General",
    });

    eventPublisher.publish("LEAD_QUALIFIED", { leadId: lead.leadId, customerCode: customer.customerCode }, { producerModule: "ECXP" }).catch(() => {});
    return { lead, customer };
  }
}

module.exports = new LeadManager();
