const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    collectionId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    outstandingAmount: { type: Number, required: true },
    ptpDate: { type: Date }, // Promise-To-Pay Date
    promisedAmount: { type: Number },
    status: { type: String, enum: ["Pending", "Collected", "Overdue"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);
