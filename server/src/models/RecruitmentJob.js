const mongoose = require("mongoose");

const recruitmentJobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    companyCode: { type: String, default: "CMP-PRAKRITI-01" },
    title: { type: String, required: true },
    departmentCode: { type: String, required: true },
    openingsCount: { type: Number, default: 1 },
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecruitmentJob", recruitmentJobSchema);
