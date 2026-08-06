const DispatchNote = require("../../../models/DispatchNote");
const eventPublisher = require("../../events/eventPublisher");

class DispatchEngine {
  /**
   * Generates a Sales Dispatch Note and packing list.
   */
  async createDispatch(orderId, customerName, warehouseCode, items, vehicleId = "VEH-01", driverName = "Ramesh Singh") {
    const dispatchId = `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const dispatch = await DispatchNote.create({
      dispatchId,
      orderId,
      customerName,
      warehouseCode,
      vehicleId,
      driverName,
      items,
      status: "Dispatched",
    });

    // Emit DISPATCH_CREATED event to Phase 7.3A Event Bus
    eventPublisher.publish("DISPATCH_CREATED", { dispatchId, orderId, customerName }, { producerModule: "EMSCP" }).catch(() => {});

    return dispatch;
  }

  async listDispatches() {
    return DispatchNote.find({}).sort({ createdAt: -1 });
  }
}

module.exports = new DispatchEngine();
