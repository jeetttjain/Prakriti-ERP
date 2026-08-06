const mongoose = require("mongoose");

const priceListSchema = new mongoose.Schema(
  {
    priceListId: { type: String, required: true, unique: true },
    categoryName: { type: String, required: true },
    productCode: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    minQtyDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceList", priceListSchema);
