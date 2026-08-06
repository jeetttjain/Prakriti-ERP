const InventoryStock = require("../../../models/InventoryStock");
const unitConversionEngine = require("../uom/unitConversionEngine");

class InventoryEngine {
  async initializeDefaults() {
    const count = await InventoryStock.countDocuments();
    if (count > 0) return;

    await InventoryStock.create([
      { stockId: "STK-OIL-01", productCode: "PROD-OIL-01", productName: "Cold-Pressed Mustard Oil 1L", warehouseCode: "WH-MAIN-01", availableQty: 1500, reservedQty: 100, uom: "Piece", unitCost: 180, batchNumber: "B-2026-08", expiryDate: new Date("2027-08-01") },
      { stockId: "STK-GHEE-01", productCode: "PROD-GHEE-01", productName: "Pure Desi A2 Cow Ghee 500g", warehouseCode: "WH-COLD-01", availableQty: 800, reservedQty: 50, uom: "Piece", unitCost: 650, batchNumber: "B-2026-07", expiryDate: new Date("2027-07-01") },
    ]);
  }

  async listInventory() {
    await this.initializeDefaults();
    return InventoryStock.find({});
  }

  async reserveStock(productCode, warehouseCode, qty) {
    const stock = await InventoryStock.findOne({ productCode, warehouseCode });
    if (!stock || stock.availableQty < qty) {
      throw new Error(`Insufficient stock available for ${productCode} in ${warehouseCode}.`);
    }
    stock.availableQty -= qty;
    stock.reservedQty += qty;
    await stock.save();
    return stock;
  }
}

module.exports = new InventoryEngine();
