const mongoose = require("mongoose");

const hrTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    employeeCode: { type: String, required: true, index: true },
    category: { type: String, enum: ["HR", "IT", "Admin", "Asset", "Access"], default: "HR" },
    subject: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Open", "InProgress", "Resolved"], default: "Open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HRTicket", hrTicketSchema);
