const StockTransfer = require("../../../models/StockTransfer");
const eventPublisher = require("../../events/eventPublisher");

class TransferEngine {
  /**
   * Posts an inter-warehouse stock transfer order.
   */
  async createTransfer(sourceWarehouse, destinationWarehouse, items) {
    const transferId = `TRSF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const transfer = await StockTransfer.create({
      transferId,
      sourceWarehouse,
      destinationWarehouse,
      items,
      status: "InTransit",
      dispatchedAt: new Date(),
    });

    // Emit STOCK_TRANSFERRED event to Phase 7.3A Event Bus
    eventPublisher.publish("STOCK_TRANSFERRED", { transferId, sourceWarehouse, destinationWarehouse, itemCounts: items.length }, { producerModule: "EMSCP" }).catch(() => {});

    return transfer;
  }

  async listTransfers() {
    return StockTransfer.find({}).sort({ createdAt: -1 });
  }
}

module.exports = new TransferEngine();
