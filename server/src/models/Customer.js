const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    mobile: { type: String },
    contactNumber: { type: String },
    gstin: { type: String },
    pan: { type: String },
    creditLimit: { type: Number, default: 100000 },
    outstandingAmount: { type: Number, default: 0 },
    segment: { type: String, enum: ["VIP", "HighRevenue", "Wholesale", "Retail", "Restaurant", "Dormant", "General"], default: "General" },
    priceCategory: { type: String, default: "Standard" },
    status: { type: String, enum: ["Active", "Blocked", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);