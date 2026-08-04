const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
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

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
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
      unique: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    hasBranches: {
      type: Boolean,
      default: false,
    },

    branches: [branchSchema],

    paymentCycle: {
      type: Number,
      enum: [15, 30],
      default: 15,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Customer Self-Service Portal credentials
    portalEnabled: { type: Boolean, default: false },
    portalPassword: { type: String, default: null },
    portalLastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Map contactNumber to legacy mobile for backend backward compatibility before writing
customerSchema.pre("validate", function (next) {
  if (this.contactNumber) {
    this.mobile = this.contactNumber;
  }
  if (this.branches && this.branches.length > 0) {
    this.branches.forEach((b) => {
      if (b.contactNumber) {
        b.mobile = b.contactNumber;
      }
    });
  }
  next();
});

module.exports = mongoose.model("Customer", customerSchema);