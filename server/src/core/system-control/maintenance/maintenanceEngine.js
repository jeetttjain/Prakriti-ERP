const mongoose = require("mongoose");
const SystemMaintenance = require("../../../models/SystemMaintenance");
const eventPublisher = require("../../events/eventPublisher");

class MaintenanceEngine {
  async startMaintenance(bannerMessage = "Scheduled System Maintenance in Progress", mode = "Global", userCode = "ADMIN-01") {
    const maintenanceId = `MAINT-${Date.now()}`;
    const m = await SystemMaintenance.create({
      maintenanceId,
      mode,
      isReadonly: true,
      bannerMessage,
      status: "Active",
      initiatedBy: userCode,
    });

    eventPublisher.publish("MAINTENANCE_STARTED", { maintenanceId, mode, bannerMessage }, { producerModule: "SCE" }).catch(() => {});
    return m;
  }

  async stopMaintenance(maintenanceId, userCode = "ADMIN-01") {
    const query = mongoose.Types.ObjectId.isValid(maintenanceId) ? { $or: [{ _id: maintenanceId }, { maintenanceId }] } : { maintenanceId };
    const m = await SystemMaintenance.findOne(query);
    if (!m) throw new Error("Maintenance record not found.");

    m.status = "Completed";
    await m.save();

    eventPublisher.publish("MAINTENANCE_STOPPED", { maintenanceId: m.maintenanceId }, { producerModule: "SCE" }).catch(() => {});
    return m;
  }

  async getActiveMaintenance() {
    return SystemMaintenance.find({ status: "Active" });
  }
}

module.exports = new MaintenanceEngine();
