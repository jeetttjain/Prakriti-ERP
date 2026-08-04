const mongoose = require("mongoose");

const customerQRSchema = new mongoose.Schema(
  {
    qrId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    encryptedToken: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    restaurantName: {
      type: String,
      default: "Partner Restaurant",
    },
    branchName: {
      type: String,
      default: "Main Branch",
    },
    tableOrLocation: {
      type: String,
      default: "General",
    },
    priceListTier: {
      type: String,
      enum: ["RETAIL", "WHOLESALE", "VIP_TIER", "TIER_A", "TIER_B"],
      default: "WHOLESALE",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

customerQRSchema.index({ qrId: 1, status: 1 });

module.exports = mongoose.model("CustomerQR", customerQRSchema);
