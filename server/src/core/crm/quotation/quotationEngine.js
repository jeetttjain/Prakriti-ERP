const Quotation = require("../../../models/Quotation");
const activityEngine = require("../activities/activityEngine");
const eventPublisher = require("../../events/eventPublisher");
const notificationRouter = require("../../communication/routing/notificationRouter");

class QuotationEngine {
  async initializeDefaults() {
    const count = await Quotation.countDocuments();
    if (count > 0) return;

    await Quotation.create([
      { quotationId: "QT-901", customerCode: "CUST-B2B-01", items: [{ productCode: "PROD-OIL-01", quantity: 500, unitPrice: 180 }], totalAmount: 90000, discountPct: 5, taxAmount: 4275, status: "Sent" },
    ]);
  }

  async listQuotations() {
    await this.initializeDefaults();
    return Quotation.find({}).sort({ createdAt: -1 });
  }

  async createQuotation(customerCode, items, discountPct = 5) {
    const quotationId = `QT-${Date.now().toString().slice(-4)}`;
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.unitPrice;
    }
    totalAmount = totalAmount * (1 - discountPct / 100);
    const taxAmount = totalAmount * 0.05; // 5% GST

    const quotation = await Quotation.create({
      quotationId,
      customerCode,
      items,
      totalAmount: totalAmount + taxAmount,
      discountPct,
      taxAmount,
      status: "Sent",
    });

    // Log Activity
    await activityEngine.logActivity(customerCode, "Quotation", `Quotation ${quotationId} Issued`, { totalAmount: quotation.totalAmount });

    // Send Quotation Dispatch via Phase 7.3B Communication Engine
    notificationRouter.send({
      recipientId: customerCode,
      recipientAddress: "+919829055555",
      templateId: "TMPL_QUOTATION_DISPATCH",
      variables: { quotationId, totalAmount: quotation.totalAmount },
      entityType: "Quotation",
      entityId: quotationId,
      category: "Transactional",
    }).catch(() => {});

    // Emit QUOTATION_CREATED event into Phase 7.3A Event Bus
    eventPublisher.publish("QUOTATION_CREATED", { quotationId, customerCode, totalAmount: quotation.totalAmount }, { producerModule: "ECXP" }).catch(() => {});

    return quotation;
  }
}

module.exports = new QuotationEngine();
