const mongoose = require("mongoose");
const SystemModule = require("../../../models/SystemModule");
const dependencyOrchestrator = require("../orchestration/dependencyOrchestrator");
const eventPublisher = require("../../events/eventPublisher");

class SystemControlEngine {
  /**
   * Starts a module.
   */
  async startModule(moduleId, userCode = "ADMIN-01") {
    const query = mongoose.Types.ObjectId.isValid(moduleId) ? { $or: [{ _id: moduleId }, { moduleId }] } : { moduleId };
    const mod = await SystemModule.findOne(query);
    if (!mod) throw new Error(`Module ${moduleId} not found.`);

    mod.status = "Running";
    mod.healthStatus = "Healthy";
    await mod.save();

    eventPublisher.publish("MODULE_STARTED", { moduleId: mod.moduleId, name: mod.name }, { producerModule: "SCE" }).catch(() => {});
    return mod;
  }

  /**
   * Stops a module after validating safe DAG dependency tree.
   */
  async stopModule(moduleId, force = false, userCode = "ADMIN-01") {
    const query = mongoose.Types.ObjectId.isValid(moduleId) ? { $or: [{ _id: moduleId }, { moduleId }] } : { moduleId };
    const mod = await SystemModule.findOne(query);
    if (!mod) throw new Error(`Module ${moduleId} not found.`);

    const check = await dependencyOrchestrator.validateSafeShutdown(mod.moduleId, force);
    if (!check.safe) throw new Error(check.reason);

    mod.status = "Stopped";
    await mod.save();

    eventPublisher.publish("MODULE_STOPPED", { moduleId: mod.moduleId, name: mod.name }, { producerModule: "SCE" }).catch(() => {});
    return mod;
  }

  /**
   * Restarts a module.
   */
  async restartModule(moduleId, userCode = "ADMIN-01") {
    const query = mongoose.Types.ObjectId.isValid(moduleId) ? { $or: [{ _id: moduleId }, { moduleId }] } : { moduleId };
    const mod = await SystemModule.findOne(query);
    if (!mod) throw new Error(`Module ${moduleId} not found.`);

    mod.status = "Running";
    mod.healthStatus = "Healthy";
    await mod.save();

    return mod;
  }
}

module.exports = new SystemControlEngine();
