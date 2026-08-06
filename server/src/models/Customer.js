const mongoose = require("mongoose");
const { normalizePhone } = require("../utils/phoneUtils");

const customerSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, set: normalizePhone, get: normalizePhone },
    mobile: { type: String, set: normalizePhone, get: normalizePhone },
    contactNumber: { type: String, set: normalizePhone, get: normalizePhone },
    whatsappNumber: { type: String, set: normalizePhone, get: normalizePhone },
    gstin: { type: String },
    pan: { type: String },
    creditLimit: { type: Number, default: 100000 },
    outstandingAmount: { type: Number, default: 0 },
    segment: { type: String, enum: ["VIP", "HighRevenue", "Wholesale", "Retail", "Restaurant", "Dormant", "General"], default: "General" },
    priceCategory: { type: String, default: "Standard" },
    status: { type: String, enum: ["Active", "Blocked", "Inactive"], default: "Active" },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

// Pre-save hook for normalization
customerSchema.pre("save", function () {
  if (this.phone) this.phone = normalizePhone(this.phone);
  if (this.mobile) this.mobile = normalizePhone(this.mobile);
  if (this.contactNumber) this.contactNumber = normalizePhone(this.contactNumber);
  if (this.whatsappNumber) this.whatsappNumber = normalizePhone(this.whatsappNumber);
});

module.exports = mongoose.model("Customer", customerSchema);