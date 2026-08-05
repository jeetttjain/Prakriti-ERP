const mongoose = require("mongoose");

const systemMetricSchema = new mongoose.Schema(
  {
    metricId: { type: String, required: true, unique: true },
    category: { type: String, enum: ["CPU", "MEMORY", "DISK", "MONGODB", "API", "QUEUE"], required: true },
    metricName: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: "count" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemMetric", systemMetricSchema);
