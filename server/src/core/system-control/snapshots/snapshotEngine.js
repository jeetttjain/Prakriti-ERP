const SystemSnapshot = require("../../../models/SystemSnapshot");
const SystemModule = require("../../../models/SystemModule");
const FeatureFlag = require("../../../models/FeatureFlag");
const SystemConfig = require("../../../models/SystemConfig");

class SnapshotEngine {
  /**
   * Captures a complete system state snapshot.
   */
  async createSnapshot(description = "System State Backup", userCode = "ADMIN-01") {
    const snapshotId = `SNAP-${Date.now()}`;
    const modules = await SystemModule.find({});
    const flags = await FeatureFlag.find({});
    const configs = await SystemConfig.find({});

    return SystemSnapshot.create({
      snapshotId,
      description,
      modules,
      flags,
      configs,
      createdBy: userCode,
    });
  }

  /**
   * One-click restore of full system state.
   */
  async restoreSnapshot(snapshotId, userCode = "ADMIN-01") {
    const snap = await SystemSnapshot.findOne({ snapshotId });
    if (!snap) throw new Error(`Snapshot ${snapshotId} not found.`);

    // Restore modules
    for (const modData of snap.modules) {
      await SystemModule.findOneAndUpdate({ moduleId: modData.moduleId }, { status: modData.status }, { upsert: true });
    }

    // Restore flags
    for (const flagData of snap.flags) {
      await FeatureFlag.findOneAndUpdate({ key: flagData.key }, { isEnabled: flagData.isEnabled }, { upsert: true });
    }

    return snap;
  }
}

module.exports = new SnapshotEngine();
