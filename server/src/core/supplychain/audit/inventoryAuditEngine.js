const InventoryAudit = require("../../../models/InventoryAudit");
const journalEngine = require("../../finance/journal/journalEngine");

class InventoryAuditEngine {
  /**
   * Executes physical cycle count audit and posts finance adjustment if variance > 0.
   */
  async conductCycleCount(warehouseCode, productCode, expectedQty, countedQty, userCode = "STORE-KEEPER") {
    const varianceQty = countedQty - expectedQty;
    const auditId = `AUD-STK-${Date.now()}`;

    const audit = await InventoryAudit.create({
      auditId,
      warehouseCode,
      productCode,
      expectedQty,
      countedQty,
      varianceQty,
      conductedBy: userCode,
      status: "Approved",
    });

    // If variance exists, post double-entry adjustment to Finance
    if (varianceQty !== 0) {
      const adjustmentVal = Math.abs(varianceQty) * 150;
      const lines = varianceQty > 0
        ? [
            { accountCode: "1200", debit: adjustmentVal, credit: 0, description: `Inventory Audit Gain (${varianceQty} units)` },
            { accountCode: "4000", debit: 0, credit: adjustmentVal, description: `Inventory Adjustment Credit` },
          ]
        : [
            { accountCode: "5100", debit: adjustmentVal, credit: 0, description: `Inventory Audit Loss (${varianceQty} units)` },
            { accountCode: "1200", debit: 0, credit: adjustmentVal, description: `Inventory Adjustment Credit` },
          ];

      await journalEngine.postJournal(`Stock Audit Adjustment for ${productCode}`, lines, userCode).catch(() => {});
    }

    return audit;
  }
}

module.exports = new InventoryAuditEngine();
