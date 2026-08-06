const mongoose = require("mongoose");

const qualityInspectionSchema = new mongoose.Schema(
  {
    inspectionId: { type: String, required: true, unique: true },
    productCode: { type: String, required: true },
    batchNumber: { type: String, required: true },
    sampleSize: { type: Number, default: 10 },
    passedQty: { type: Number, required: true },
    rejectedQty: { type: Number, default: 0 },
    qualityGrade: { type: String, enum: ["GradeA", "GradeB", "Rejected"], default: "GradeA" },
    inspectorName: { type: String, default: "QC Inspector" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QualityInspection", qualityInspectionSchema);
