const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    priority: {
      type: String,
      enum: ["Normal", "Popular", "Featured"],
      default: "Normal",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
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

// Concurrency-safe atomic generators before validate stage
productSchema.pre("validate", async function () {
  if (this.isNew) {
    // Generate URL friendly slug on creation only (remains immutable)
    if (this.productName && !this.slug) {
      this.slug = this.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Generate prefix sequence atomically (e.g. VEG-0001)
    if (!this.productCode) {
      const prefix = (this.category || "PRD").substring(0, 3).toUpperCase();
      this.productCode = await generateCounter(`productCode_${prefix}`, prefix, 4);
    }
  }
});

module.exports = mongoose.model("Product", productSchema);
