const mongoose = require("mongoose");

const customerDocumentSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    type: { type: String, required: true }, // GST, PAN, Agreement, KYC
    edpResourceId: { type: String, required: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerDocument", customerDocumentSchema);
