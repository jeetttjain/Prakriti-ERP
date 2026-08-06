const DeliveryRoute = require("../../../models/DeliveryRoute");

class RoutingEngine {
  async initializeDefaults() {
    const count = await DeliveryRoute.countDocuments();
    if (count > 0) return;

    await DeliveryRoute.create([
      {
        routeId: "RTE-JPR-NORTH",
        routeName: "Jaipur North Retail Distribution Route",
        distanceKm: 32,
        estimatedTimeMins: 75,
        stops: [
          { stopName: "Main Warehouse Hub", sequence: 1 },
          { stopName: "Malviya Nagar Store", sequence: 2 },
          { stopName: "Vaishali Nagar Distribution Hub", sequence: 3 },
        ],
      },
    ]);
  }

  async listRoutes() {
    await this.initializeDefaults();
    return DeliveryRoute.find({});
  }
}

module.exports = new RoutingEngine();
