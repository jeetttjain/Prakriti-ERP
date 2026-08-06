const mongoose = require("mongoose");

const customerTimelineSchema = new mongoose.Schema(
  {
    timelineId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    userCode: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerTimeline", customerTimelineSchema);
