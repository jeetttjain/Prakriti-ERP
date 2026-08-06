const Warehouse = require("../../../models/Warehouse");

class WarehouseEngine {
  async initializeDefaults() {
    const count = await Warehouse.countDocuments();
    if (count > 0) return;

    await Warehouse.create([
      { warehouseCode: "WH-MAIN-01", name: "Jaipur Main Central Fulfillment Center", type: "Main", branchCode: "BR-HQ-01", capacityUnits: 25000, currentUnits: 12400 },
      { warehouseCode: "WH-COLD-01", name: "Jaipur Cold Storage Facility (4°C)", type: "ColdStorage", branchCode: "BR-HQ-01", capacityUnits: 10000, currentUnits: 4200, temperatureCelsius: 4 },
      { warehouseCode: "WH-TRANSIT-01", name: "Delhi Transit Storage Hub", type: "Transit", branchCode: "BR-DEL-01", capacityUnits: 8000, currentUnits: 1500 },
    ]);
  }

  async listWarehouses() {
    await this.initializeDefaults();
    return Warehouse.find({});
  }
}

module.exports = new WarehouseEngine();
