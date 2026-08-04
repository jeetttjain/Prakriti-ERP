const mongoose = require("mongoose");

/**
 * Tracks products saved as favourites by a customer in the self-service portal.
 * Compound unique index ensures one entry per customer-product pair.
 */
const customerFavoriteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

customerFavoriteSchema.index({ customerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("CustomerFavorite", customerFavoriteSchema);
