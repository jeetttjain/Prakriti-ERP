const SystemModule = require("../../../models/SystemModule");

class DependencyOrchestrator {
  /**
   * Validates if a module can be safely stopped without breaking dependent running modules.
   */
  async validateSafeShutdown(targetModuleId, force = false) {
    if (force) return { safe: true, reason: "Forced shutdown approved." };

    const runningModules = await SystemModule.find({ status: "Running" });
    const dependents = runningModules.filter((m) => m.dependencies.includes(targetModuleId));

    if (dependents.length > 0) {
      const dependentNames = dependents.map((d) => d.name).join(", ");
      return {
        safe: false,
        reason: `Cannot stop module ${targetModuleId} safely. Active dependent running modules: [${dependentNames}]. Use force=true to override.`,
      };
    }

    return { safe: true, reason: "No active dependent running modules." };
  }
}

module.exports = new DependencyOrchestrator();
