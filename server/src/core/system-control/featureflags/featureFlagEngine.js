const mongoose = require("mongoose");
const FeatureFlag = require("../../../models/FeatureFlag");
const eventPublisher = require("../../events/eventPublisher");

class FeatureFlagEngine {
  async initializeDefaults() {
    const count = await FeatureFlag.countDocuments();
    if (count > 0) return;

    const defaultFlags = [
      { flagId: "FLAG-WHATSAPP", key: "whatsapp_notifications", name: "WhatsApp Dispatch Notifications", isEnabled: true, category: "Communication" },
      { flagId: "FLAG-SMS", key: "sms_gateway", name: "SMS Gateway Provider", isEnabled: true, category: "Communication" },
      { flagId: "FLAG-COLDSTORAGE", key: "cold_storage_monitoring", name: "Cold Storage Temperature Monitoring", isEnabled: true, category: "SupplyChain" },
      { flagId: "FLAG-GST", key: "gst_tax_engine", name: "GST Tax Calculation Engine", isEnabled: true, category: "Finance" },
      { flagId: "FLAG-BARCODE", key: "barcode_scanning", name: "Barcode / QR Scanning Integration", isEnabled: false, category: "Hardware" },
    ];

    await FeatureFlag.insertMany(defaultFlags);
  }

  async listFlags() {
    await this.initializeDefaults();
    return FeatureFlag.find({});
  }

  async setFlag(key, isEnabled, userCode = "ADMIN-01") {
    const query = mongoose.Types.ObjectId.isValid(key) ? { $or: [{ _id: key }, { key }, { flagId: key }] } : { $or: [{ key }, { flagId: key }] };
    let flag = await FeatureFlag.findOne(query);
    if (!flag) throw new Error(`Feature flag ${key} not found.`);

    flag.isEnabled = isEnabled;
    await flag.save();

    const eventName = isEnabled ? "FEATURE_ENABLED" : "FEATURE_DISABLED";
    eventPublisher.publish(eventName, { key: flag.key, name: flag.name }, { producerModule: "SCE" }).catch(() => {});

    return flag;
  }
}

module.exports = new FeatureFlagEngine();
