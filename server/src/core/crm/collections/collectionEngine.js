const Collection = require("../../../models/Collection");
const Customer = require("../../../models/Customer");
const journalEngine = require("../../finance/journal/journalEngine");
const eventPublisher = require("../../events/eventPublisher");

class CollectionEngine {
  async listCollections() {
    return Collection.find({}).sort({ createdAt: -1 });
  }

  async recordPaymentReceipt(customerCode, amount, userCode = "COLLECTION-EXEC") {
    const collectionId = `COL-${Date.now()}`;
    const col = await Collection.create({
      collectionId,
      customerCode,
      outstandingAmount: amount,
      status: "Collected",
    });

    // Update Customer outstanding balance
    const cust = await Customer.findOne({ customerCode });
    if (cust) {
      cust.outstandingAmount = Math.max(0, cust.outstandingAmount - amount);
      await cust.save();
    }

    // Post double-entry receipt journal entries to Phase 7.7 EFAP
    const journalLines = [
      { accountCode: "1000", debit: amount, credit: 0, description: `Customer Collection Payment Receipt (${customerCode})` },
      { accountCode: "1100", debit: 0, credit: amount, description: `Accounts Receivable Clearance` },
    ];
    await journalEngine.postJournal(`Customer Collection Payment Receipt for ${customerCode}`, journalLines, userCode).catch(() => {});

    eventPublisher.publish("PAYMENT_RECEIVED", { collectionId, customerCode, amount }, { producerModule: "ECXP" }).catch(() => {});

    return col;
  }
}

module.exports = new CollectionEngine();
