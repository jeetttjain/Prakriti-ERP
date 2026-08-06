const mongoose = require("mongoose");

const salesVisitSchema = new mongoose.Schema(
  {
    visitId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    executiveCode: { type: String, required: true },
    visitDate: { type: Date, default: Date.now },
    gpsLocation: { type: String, default: "26.9124° N, 75.7873° E" },
    notes: { type: String },
    outcome: { type: String, enum: ["OrderPlaced", "FollowupRequired", "Completed"], default: "Completed" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesVisit", salesVisitSchema);
