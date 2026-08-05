const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    journalId: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    narration: { type: String, required: true },
    lines: [
      {
        accountCode: { type: String, required: true },
        accountName: { type: String },
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 },
        description: { type: String },
      },
    ],
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    status: { type: String, enum: ["Draft", "Posted", "Cancelled"], default: "Posted" },
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
    createdBy: { type: String, default: "SYSTEM" },
    approvedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
