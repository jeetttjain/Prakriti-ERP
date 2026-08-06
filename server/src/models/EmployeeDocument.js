const mongoose = require("mongoose");

const employeeDocumentSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, unique: true },
    employeeCode: { type: String, required: true, index: true },
    type: { type: String, required: true }, // Aadhaar, PAN, Resume, Contract
    documentUrl: { type: String, required: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeDocument", employeeDocumentSchema);
