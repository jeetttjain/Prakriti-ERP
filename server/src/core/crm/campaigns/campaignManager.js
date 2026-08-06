const Campaign = require("../../../models/Campaign");
const CampaignMember = require("../../../models/CampaignMember");

class CampaignManager {
  async listCampaigns() {
    const count = await Campaign.countDocuments();
    if (count === 0) {
      await Campaign.create([
        { campaignId: "CMPG-101", name: "Festival Festive Wholesale Discount Drive", channel: "WhatsApp", targetSegment: "VIP", budget: 25000, revenueGenerated: 450000, status: "Active" },
      ]);
    }
    return Campaign.find({}).sort({ createdAt: -1 });
  }

  async createCampaign(name, channel = "WhatsApp", targetSegment = "VIP", budget = 30000) {
    const campaignId = `CMPG-${Date.now().toString().slice(-4)}`;
    return Campaign.create({
      campaignId,
      name,
      channel,
      targetSegment,
      budget,
      status: "Active",
    });
  }
}

module.exports = new CampaignManager();
