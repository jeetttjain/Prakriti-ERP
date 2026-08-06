const Attendance = require("../../../models/Attendance");
const eventPublisher = require("../../events/eventPublisher");

class AttendanceEngine {
  async initializeDefaults() {
    const count = await Attendance.countDocuments();
    if (count > 0) return;

    await Attendance.create([
      { attendanceId: "ATT-001", employeeCode: "EMP-001", date: new Date(), checkIn: new Date(), status: "Present", method: "Biometric" },
      { attendanceId: "ATT-002", employeeCode: "EMP-002", date: new Date(), checkIn: new Date(), status: "Present", method: "GPS" },
    ]);
  }

  async listAttendance() {
    await this.initializeDefaults();
    return Attendance.find({}).sort({ createdAt: -1 });
  }

  async markAttendance(employeeCode, method = "Manual", status = "Present") {
    const attendanceId = `ATT-${Date.now()}`;
    const att = await Attendance.create({
      attendanceId,
      employeeCode,
      date: new Date(),
      checkIn: new Date(),
      status,
      method,
    });

    eventPublisher.publish("ATTENDANCE_MARKED", { attendanceId, employeeCode, status, method }, { producerModule: "EHRMP" }).catch(() => {});
    return att;
  }
}

module.exports = new AttendanceEngine();
