const mongoose = require("mongoose");

const businessHealthSnapshotSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    subScores: {
      sales: { type: Number, default: 100 },
      inventory: { type: Number, default: 100 },
      finance: { type: Number, default: 100 },
      customers: { type: Number, default: 100 },
      suppliers: { type: Number, default: 100 },
      operations: { type: Number, default: 100 },
    },
    metricsSummary: { type: mongoose.Schema.Types.Mixed, default: {} },
    snapshotDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessHealthSnapshot", businessHealthSnapshotSchema);
