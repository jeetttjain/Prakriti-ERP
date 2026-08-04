const mongoose = require("mongoose");

/**
 * Promotional offers displayed in the Customer Self-Service Portal.
 * Admin creates offers via ERP; portal reads active ones.
 */
const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Label = just a banner, Flat/Percentage = actual discount applied by admin during order
    discountType: {
      type: String,
      enum: ["Label", "Flat", "Percentage"],
      default: "Label",
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    applicableCategory: {
      type: String,
      default: "",
      trim: true,
    },

    validFrom: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    priority: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
