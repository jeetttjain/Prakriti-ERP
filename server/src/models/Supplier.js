const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    personName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    gst: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    supplierCategory: {
      type: String,
      default: "Wholesaler",
      trim: true,
    },
    supplierRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    paymentTerms: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: String,
      default: null,
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.pre("validate", async function () {
  if (this.isNew && !this.supplierCode) {
    this.supplierCode = await generateCounter("supplierCode", "SPL", 6);
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);
