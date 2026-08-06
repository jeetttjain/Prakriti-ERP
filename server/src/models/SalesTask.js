const mongoose = require("mongoose");

const salesTaskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, unique: true },
    executiveCode: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["Visit", "Call", "Quotation", "Collection", "FollowUp", "Meeting"], default: "Call" },
    dueDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesTask", salesTaskSchema);
