const SystemConfig = require("../../../models/SystemConfig");
const configVersionEngine = require("./configVersionEngine");
const eventPublisher = require("../../events/eventPublisher");

class ConfigEngine {
  async initializeDefaults() {
    const count = await SystemConfig.countDocuments();
    if (count > 0) return;

    const defaultConfigs = [
      { configKey: "SYSTEM_COMPANY_NAME", value: "Prakriti ERP Enterprise", category: "Global", version: 1 },
      { configKey: "CURRENCY_BASE", value: "INR", category: "Finance", version: 1 },
      { configKey: "LOG_RETENTION_DAYS", value: 30, category: "Observability", version: 1 },
    ];

    await SystemConfig.insertMany(defaultConfigs);
  }

  async listConfigs() {
    await this.initializeDefaults();
    return SystemConfig.find({});
  }

  async updateConfig(configKey, value, userCode = "ADMIN-01") {
    let cfg = await SystemConfig.findOne({ configKey });
    if (!cfg) {
      cfg = await SystemConfig.create({ configKey, value, version: 1, updatedBy: userCode });
    } else {
      await configVersionEngine.recordVersion(cfg.configKey, cfg.value, cfg.version, userCode);
      cfg.value = value;
      cfg.version += 1;
      cfg.updatedBy = userCode;
      await cfg.save();
    }

    eventPublisher.publish("CONFIG_UPDATED", { configKey, version: cfg.version }, { producerModule: "SCE" }).catch(() => {});
    return cfg;
  }
}

module.exports = new ConfigEngine();
