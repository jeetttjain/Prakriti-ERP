const Vehicle = require("../../../models/Vehicle");

class FleetManager {
  async initializeDefaults() {
    const count = await Vehicle.countDocuments();
    if (count > 0) return;

    await Vehicle.create([
      { vehicleId: "VEH-01", registrationNumber: "RJ-14-GA-8921", type: "RefrigeratedVan", driverName: "Ramesh Singh", driverPhone: "+919829012345", capacityKg: 2500, status: "Available" },
      { vehicleId: "VEH-02", registrationNumber: "RJ-14-GC-4410", type: "MiniTruck", driverName: "Vikram Sharma", driverPhone: "+919829098765", capacityKg: 1500, status: "Available" },
    ]);
  }

  async listVehicles() {
    await this.initializeDefaults();
    return Vehicle.find({});
  }
}

module.exports = new FleetManager();
