/**
 * Attachment Engine generating PDF invoices, QR codes, receipts, and reports before delivery.
 */
class AttachmentEngine {
  async generateAttachment(type, entityId) {
    switch (type) {
      case "PDF_INVOICE":
        return {
          name: `Invoice_${entityId}.pdf`,
          type: "application/pdf",
          url: `/api/export/invoice/${entityId}.pdf`,
        };
      case "QR_CODE":
        return {
          name: `QR_${entityId}.png`,
          type: "image/png",
          url: `/api/export/qr/${entityId}.png`,
        };
      case "RECEIPT":
        return {
          name: `Receipt_${entityId}.pdf`,
          type: "application/pdf",
          url: `/api/export/receipt/${entityId}.pdf`,
        };
      default:
        return null;
    }
  }
}

module.exports = new AttachmentEngine();
