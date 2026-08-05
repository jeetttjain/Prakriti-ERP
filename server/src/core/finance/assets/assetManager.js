const Asset = require("../../../models/Asset");

class AssetManager {
  async initializeDefaults() {
    const count = await Asset.countDocuments();
    if (count > 0) return;

    await Asset.create([
      { assetId: "AST-MACH-01", assetName: "Cold-Press Oil Extraction Machine", category: "Machinery", purchaseValue: 750000, currentValue: 675000, depreciationRatePct: 10 },
      { assetId: "AST-VEH-01", assetName: "Delivery Van (Tata Ace)", category: "Vehicles", purchaseValue: 480000, currentValue: 384000, depreciationRatePct: 15 },
    ]);
  }

  async listAssets() {
    await this.initializeDefaults();
    return Asset.find({});
  }
}

module.exports = new AssetManager();
