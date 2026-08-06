# Route Planning & Fleet Logistics — Specification

## Route Optimization Engine (`routingEngine.js` & `fleetManager.js`)
- **Fleet Management**: Manages refrigerated vans and mini-trucks (`Vehicle.js`), tracking capacity (kg), drivers, and fuel logs.
- **Route Optimization**: Groups delivery addresses into sequential stops (`DeliveryRoute.js`), estimating distance (km) and travel time (mins).
