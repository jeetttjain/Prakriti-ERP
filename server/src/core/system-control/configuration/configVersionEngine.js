const SystemConfig = require("../../../models/SystemConfig");
const ConfigVersion = require("../../../models/ConfigVersion");

class ConfigVersionEngine {
  /**
   * Saves a new version snapshot before updating configuration.
   */
  async recordVersion(configKey, value, version, changedBy = "ADMIN-01", reason = "Configuration update") {
    const versionId = `CFG-VER-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    return ConfigVersion.create({
      versionId,
      configKey,
      value,
      version,
      changedBy,
      reason,
    });
  }

  /**
   * Rolls back configuration to a historical version.
   */
  async rollbackConfig(configKey, versionId, userCode = "ADMIN-01") {
    const targetVer = await ConfigVersion.findOne({ versionId });
    if (!targetVer) throw new Error(`Configuration version snapshot ${versionId} not found.`);

    let config = await SystemConfig.findOne({ configKey });
    if (!config) {
      config = await SystemConfig.create({
        configKey,
        value: targetVer.value,
        version: targetVer.version,
        updatedBy: userCode,
      });
    } else {
      config.value = targetVer.value;
      config.version += 1;
      config.updatedBy = userCode;
      await config.save();
    }

    return config;
  }
}

module.exports = new ConfigVersionEngine();
