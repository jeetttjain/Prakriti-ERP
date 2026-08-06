const mongoose = require("mongoose");

const visitorPassSchema = new mongoose.Schema(
  {
    passId: { type: String, required: true, unique: true },
    visitorName: { type: String, required: true },
    companyRepresented: { type: String },
    purpose: { type: String, required: true },
    hostUserCode: { type: String, required: true },
    checkIn: { type: Date, default: Date.now },
    checkOut: { type: Date },
    status: { type: String, enum: ["CheckedIn", "CheckedOut"], default: "CheckedIn" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitorPass", visitorPassSchema);
