const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // Snapshot of customer at time of submission
    customerSnapshot: {
      businessName: { type: String, required: true },
      contactPerson: { type: String, required: true },
      mobile: { type: String, required: true },
    },

    type: {
      type: String,
      enum: ["Question", "Complaint", "Suggestion"],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },

    adminReply: {
      type: String,
      default: "",
      trim: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

supportTicketSchema.pre("validate", async function () {
  if (this.isNew && !this.ticketNumber) {
    this.ticketNumber = await generateCounter("supportTicketNumber", "TKT", 5);
  }
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
