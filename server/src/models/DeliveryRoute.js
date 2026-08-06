const mongoose = require("mongoose");

const deliveryRouteSchema = new mongoose.Schema(
  {
    routeId: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },
    stops: [
      {
        stopName: { type: String, required: true },
        address: { type: String },
        sequence: { type: Number, required: true },
      },
    ],
    distanceKm: { type: Number, default: 25 },
    estimatedTimeMins: { type: Number, default: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryRoute", deliveryRouteSchema);
