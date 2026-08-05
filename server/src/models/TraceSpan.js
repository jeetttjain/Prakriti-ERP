const mongoose = require("mongoose");

const traceSpanSchema = new mongoose.Schema(
  {
    traceId: { type: String, required: true, index: true },
    spanId: { type: String, required: true, unique: true },
    parentSpanId: { type: String },
    correlationId: { type: String, index: true },
    operationName: { type: String, required: true },
    module: { type: String, default: "API" },
    durationMs: { type: Number, required: true },
    status: { type: String, enum: ["OK", "ERROR"], default: "OK" },
    tags: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraceSpan", traceSpanSchema);
