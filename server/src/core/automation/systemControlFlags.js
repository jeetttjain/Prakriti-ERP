/**
 * Central System Control Flags for Automation Subsystems.
 */
class SystemControlFlags {
  constructor() {
    this.isEngineEnabled = true;
    this.isSchedulerEnabled = true;
    this.isQueueEnabled = true;
    this.isMaintenanceMode = false;
  }

  setEngineStatus(enabled) {
    this.isEngineEnabled = Boolean(enabled);
  }

  setSchedulerStatus(enabled) {
    this.isSchedulerEnabled = Boolean(enabled);
  }

  setQueueStatus(enabled) {
    this.isQueueEnabled = Boolean(enabled);
  }

  setMaintenanceMode(maintenance) {
    this.isMaintenanceMode = Boolean(maintenance);
  }

  getStatus() {
    return {
      isEngineEnabled: this.isEngineEnabled,
      isSchedulerEnabled: this.isSchedulerEnabled,
      isQueueEnabled: this.isQueueEnabled,
      isMaintenanceMode: this.isMaintenanceMode,
    };
  }
}

module.exports = {
  systemControlFlags: new SystemControlFlags(),
};
