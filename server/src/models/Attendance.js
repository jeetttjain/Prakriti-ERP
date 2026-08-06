const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: { type: String, required: true, unique: true },
    companyCode: { type: String, default: "CMP-PRAKRITI-01" },
    employeeCode: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ["Present", "Absent", "HalfDay", "Late"], default: "Present" },
    method: { type: String, enum: ["Manual", "GPS", "Biometric", "WiFi"], default: "Manual" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
