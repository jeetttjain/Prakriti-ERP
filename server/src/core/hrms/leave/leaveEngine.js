const LeaveRequest = require("../../../models/LeaveRequest");
const eventPublisher = require("../../events/eventPublisher");

class LeaveEngine {
  async initializeDefaults() {
    const count = await LeaveRequest.countDocuments();
    if (count > 0) return;

    await LeaveRequest.create([
      { leaveId: "LV-001", employeeCode: "EMP-003", type: "Casual", startDate: new Date("2026-08-10"), endDate: new Date("2026-08-11"), reason: "Family Function", status: "Approved" },
    ]);
  }

  async listLeaveRequests() {
    await this.initializeDefaults();
    return LeaveRequest.find({}).sort({ createdAt: -1 });
  }

  async applyLeave(employeeCode, type, startDate, endDate, reason) {
    const leaveId = `LV-${Date.now()}`;
    const leave = await LeaveRequest.create({
      leaveId,
      employeeCode,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "Approved",
    });

    eventPublisher.publish("LEAVE_APPROVED", { leaveId, employeeCode, type }, { producerModule: "EHRMP" }).catch(() => {});
    return leave;
  }
}

module.exports = new LeaveEngine();
