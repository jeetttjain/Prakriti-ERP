const mongoose = require("mongoose");

const generalLedgerSchema = new mongoose.Schema(
  {
    ledgerId: { type: String, required: true, unique: true },
    accountCode: { type: String, required: true, index: true },
    journalId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    narration: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GeneralLedger", generalLedgerSchema);
