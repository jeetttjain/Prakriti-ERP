const mongoose = require("mongoose");

const importJobSchema = new mongoose.Schema(
  {
    importId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    targetModule: { type: String, required: true },
    format: { type: String, enum: ["CSV", "EXCEL", "JSON", "XML", "ZIP"], default: "CSV" },
    totalRows: { type: Number, default: 0 },
    successRows: { type: Number, default: 0 },
    failedRows: { type: Number, default: 0 },
    status: { type: String, enum: ["PREVIEW", "COMPLETED", "FAILED", "ROLLED_BACK"], default: "COMPLETED" },
    errorLog: [{ row: Number, error: String }],
    rollbackSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportJob", importJobSchema);
