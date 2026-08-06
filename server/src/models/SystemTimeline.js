const mongoose = require("mongoose");

const systemTimelineSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    userCode: { type: String, default: "SYSTEM" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemTimeline", systemTimelineSchema);
