const LoyaltyAccount = require("../../../models/LoyaltyAccount");
const eventPublisher = require("../../events/eventPublisher");

class LoyaltyEngine {
  async getLoyaltyAccount(customerCode) {
    let acc = await LoyaltyAccount.findOne({ customerCode });
    if (!acc) {
      acc = await LoyaltyAccount.create({ customerCode, tier: "Gold", pointsBalance: 1250, totalRedeemed: 300 });
    }
    return acc;
  }

  async redeemPoints(customerCode, pointsToRedeem) {
    const acc = await this.getLoyaltyAccount(customerCode);
    if (acc.pointsBalance < pointsToRedeem) {
      throw new Error(`Insufficient points balance. Available: ${acc.pointsBalance}`);
    }

    acc.pointsBalance -= pointsToRedeem;
    acc.totalRedeemed += pointsToRedeem;
    await acc.save();

    eventPublisher.publish("LOYALTY_UPDATED", { customerCode, pointsRedeemed: pointsToRedeem, newBalance: acc.pointsBalance }, { producerModule: "ECXP" }).catch(() => {});
    return acc;
  }
}

module.exports = new LoyaltyEngine();
