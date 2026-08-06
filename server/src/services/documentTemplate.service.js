const COMPANY_DETAILS = {
  name: "Prakriti Vegetable Supplier",
  tagline: "Fresh Farm Produce & B2B Supply Chain Solutions",
  address: "Plot No. 42, Mandi Complex, Sector 18, New Delhi - 110001",
  phone: "+91 98765 43210 / +91 98765 43211",
  email: "billing@prakritiveg.com",
  website: "www.prakritiveg.com",
  gstin: "07AAAAA0000A1Z5",
  pan: "AAAAA0000A",
  bankDetails: {
    bankName: "HDFC Bank Ltd.",
    accountName: "Prakriti Vegetable Supplier",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0000123",
    branch: "Mandi Branch, New Delhi",
  },
};

/**
 * Converts numeric amount to Indian Rupee Words representation.
 * @param {number} amount 
 * @returns {string} Words representation
 */
let numberToWords = null;
try {
  numberToWords = require("number-to-words");
} catch (e) {
  // Safe fallback if package not available in environment
}
const { formatPhone } = require("../utils/phoneUtils");
const convertAmountToWords = (amount) => {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  const paise = Math.round((Math.abs(Number(amount) || 0) - num) * 100);

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertChunk = (n) => {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += teens[n - 10] + " ";
    } else if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      if (n % 10 > 0) str += units[n % 10] + " ";
    } else if (n > 0) {
      str += units[n] + " ";
    }
    return str;
  };

  if (num === 0) return "Rupees Zero Only";

  let result = "";
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  if (crore > 0) result += convertChunk(crore) + "Crore ";
  if (lakh > 0) result += convertChunk(lakh) + "Lakh ";
  if (thousand > 0) result += convertChunk(thousand) + "Thousand ";
  if (rem > 0) result += convertChunk(rem);

  result = "Rupees " + result.trim();

  if (paise > 0) {
    result += " and " + convertChunk(paise).trim() + " Paise";
  }

  return result + " Only";
};

/**
 * Generates dynamic SVG QR Code matrix.
 * @param {string} text 
 * @returns {string} Inline SVG string
 */
const generateQRCodeSVG = (text = "Prakriti ERP Verified Document") => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
    <rect x="10" y="10" width="25" height="25" fill="#16a34a"/>
    <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
    <rect x="18" y="18" width="9" height="9" fill="#16a34a"/>
    
    <rect x="65" y="10" width="25" height="25" fill="#16a34a"/>
    <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
    <rect x="73" y="18" width="9" height="9" fill="#16a34a"/>

    <rect x="10" y="65" width="25" height="25" fill="#16a34a"/>
    <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
    <rect x="18" y="73" width="9" height="9" fill="#16a34a"/>

    <rect x="42" y="10" width="16" height="8" fill="#16a34a"/>
    <rect x="42" y="25" width="16" height="8" fill="#16a34a"/>
    <rect x="10" y="42" width="8" height="16" fill="#16a34a"/>
    <rect x="42" y="42" width="16" height="16" fill="#16a34a"/>
    <rect x="65" y="42" width="8" height="16" fill="#16a34a"/>
    <rect x="80" y="42" width="10" height="10" fill="#16a34a"/>
    <rect x="42" y="65" width="16" height="8" fill="#16a34a"/>
    <rect x="65" y="65" width="25" height="8" fill="#16a34a"/>
    <rect x="78" y="78" width="12" height="12" fill="#16a34a"/>
    <text x="50" y="96" font-size="6" text-anchor="middle" fill="#666666">VERIFIED</text>
  </svg>`;
};

/**
 * Base A4 Print-Optimized Layout Wrapper
 */
const renderBaseLayout = ({ title, content, documentNumber, company = COMPANY_DETAILS }) => {
  const qrSVG = generateQRCodeSVG(`${title}:${documentNumber}`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${documentNumber || ""}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 0;
      font-size: 13px;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-bottom: 2px solid #16a34a;
      padding-bottom: 10px;
    }
    .company-title {
      font-size: 22px;
      font-weight: bold;
      color: #16a34a;
      margin: 0 0 4px 0;
    }
    .doc-title {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      text-align: right;
      text-transform: uppercase;
      margin: 0;
    }
    .doc-number {
      font-size: 14px;
      color: #4b5563;
      text-align: right;
      margin-top: 4px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      vertical-align: top;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th {
      background: #16a34a;
      color: #ffffff;
      padding: 10px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
    }
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin-left: auto;
    }
    .totals-table td {
      padding: 6px 12px;
      text-align: right;
    }
    .totals-table .grand-total {
      font-size: 16px;
      font-weight: bold;
      color: #16a34a;
      background: #f0fdf4;
      border-top: 2px solid #16a34a;
    }
    .words-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 10px;
      border-radius: 6px;
      font-style: italic;
      margin-top: 10px;
    }
    .footer-table {
      width: 100%;
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    .text-right { text-align: right; }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef9c3; color: #854d0e; }
  </style>
</head>
<body>

  <!-- Header Section -->
  <table class="header-table">
    <tr>
      <td style="width: 60%;">
        <h1 class="company-title">${company.name || COMPANY_DETAILS.name}</h1>
        <div style="color: #64748b; font-size: 11px;">${company.tagline || COMPANY_DETAILS.tagline}</div>
        <div style="margin-top: 6px; color: #334155; font-size: 12px;">
          ${company.address || COMPANY_DETAILS.address}<br>
          Phone: ${company.phone || COMPANY_DETAILS.phone} | Email: ${company.email || COMPANY_DETAILS.email}<br>
          GSTIN: <strong>${company.gstin || COMPANY_DETAILS.gstin}</strong>
        </div>
      </td>
      <td style="width: 40%; text-align: right; vertical-align: top;">
        <h2 class="doc-title">${title}</h2>
        <div class="doc-number"><strong>Ref #:</strong> ${documentNumber || "N/A"}</div>
        <div style="margin-top: 8px;">${qrSVG}</div>
      </td>
    </tr>
  </table>

  <!-- Main Body Content -->
  ${content}

  <!-- Footer Section -->
  <table class="footer-table">
    <tr>
      <td style="width: 50%; vertical-align: bottom;">
        <div style="font-size: 11px; color: #64748b;">
          <strong>Terms & Conditions:</strong><br>
          1. Goods once sold will not be taken back.<br>
          2. Subject to New Delhi Jurisdiction only.<br>
          3. This is a computer generated document.
        </div>
      </td>
      <td style="width: 50%; text-align: right; vertical-align: bottom;">
        <div style="font-weight: bold; color: #1f2937; margin-bottom: 40px;">For ${company.name || COMPANY_DETAILS.name}</div>
        <div style="border-top: 1px stroke #94a3b8; display: inline-block; width: 180px; text-align: center; font-size: 11px; color: #64748b; padding-top: 4px;">
          Authorized Signatory
        </div>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

/**
 * Render Invoice A4 HTML Template
 */
const renderInvoiceHTML = (invoice, company = COMPANY_DETAILS) => {
  const customer = invoice.customerSnapshot || invoice.customerId || {};
  const items = invoice.invoiceItems || [];
  const words = numberToWords(invoice.grandTotal || 0);

  const itemsRows = items
    .map(
      (item, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${item.productName || item.displayNameSnapshot || "Item"}</strong></td>
      <td>${item.category || "General"}</td>
      <td style="text-align: right;">${item.quantity || 0} ${item.unit || "Kg"}</td>
      <td style="text-align: right;">₹${(item.sellingPriceSnapshot || 0).toFixed(2)}</td>
      <td style="text-align: right;">₹${((item.quantity || 0) * (item.sellingPriceSnapshot || 0)).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <table class="info-table">
      <tr>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">BILLED TO:</strong><br>
          <strong style="font-size: 14px; color: #1f2937;">${customer.businessName || "Valued Customer"}</strong><br>
          Contact Person: ${customer.personName || "N/A"}<br>
          Phone: ${formatPhone(customer.contactNumber || customer.mobile || customer.phone) || "N/A"}<br>
          Address: ${customer.address || "N/A"}<br>
          GSTIN: ${customer.gstNumber || "URP (Unregistered)"}
        </td>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">INVOICE DETAILS:</strong><br>
          <strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}<br>
          <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}<br>
          <strong>Payment Status:</strong> <span class="badge ${invoice.paymentStatus === "Paid" ? "badge-paid" : "badge-pending"}">${invoice.paymentStatus || "Pending"}</span><br>
          <strong>Payment Terms:</strong> ${customer.paymentCycle || 15} Days
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">#</th>
          <th style="width: 40%;">Item Description</th>
          <th style="width: 15%;">Category</th>
          <th style="width: 12%; text-align: right;">Quantity</th>
          <th style="width: 13%; text-align: right;">Rate (₹)</th>
          <th style="width: 15%; text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between;">
      <div style="width: 55%;">
        <div class="words-box">
          <strong>Amount in Words:</strong><br>${words}
        </div>
      </div>
      <div style="width: 40%;">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">₹${(invoice.subTotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Discount:</td>
            <td class="text-right">- ₹${(invoice.discount || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax / GST:</td>
            <td class="text-right">₹${(invoice.taxAmount || 0).toFixed(2)}</td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td class="text-right">₹${(invoice.grandTotal || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return renderBaseLayout({
    title: "TAX INVOICE",
    content,
    documentNumber: invoice.invoiceNumber,
    company,
  });
};

/**
 * Render Purchase Order A4 HTML Template
 */
const renderPurchaseOrderHTML = (purchase, company = COMPANY_DETAILS) => {
  const supplier = purchase.supplierSnapshot || purchase.supplierId || {};
  const items = purchase.purchaseItems || [];
  const words = numberToWords(purchase.grandTotal || 0);

  const itemsRows = items
    .map(
      (item, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${item.productName || "Product"}</strong></td>
      <td style="text-align: right;">${item.quantity || 0}</td>
      <td style="text-align: right;">₹${(item.purchasePrice || 0).toFixed(2)}</td>
      <td style="text-align: right;">₹${((item.quantity || 0) * (item.purchasePrice || 0)).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <table class="info-table">
      <tr>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">SUPPLIER PARTNER:</strong><br>
          <strong style="font-size: 14px;">${supplier.businessName || "Supplier"}</strong><br>
          Contact: ${supplier.personName || "N/A"}<br>
          Phone: ${supplier.mobile || "N/A"}<br>
          GSTIN: ${supplier.gst || "N/A"}
        </td>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">PURCHASE DETAILS:</strong><br>
          <strong>PO Date:</strong> ${new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}<br>
          <strong>Status:</strong> ${purchase.purchaseStatus || "Draft"}
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">#</th>
          <th style="width: 50%;">Item Description</th>
          <th style="width: 15%; text-align: right;">Quantity</th>
          <th style="width: 15%; text-align: right;">Unit Cost (₹)</th>
          <th style="width: 15%; text-align: right;">Subtotal (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between;">
      <div style="width: 55%;">
        <div class="words-box">
          <strong>Amount in Words:</strong><br>${words}
        </div>
      </div>
      <div style="width: 40%;">
        <table class="totals-table">
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td class="text-right">₹${(purchase.grandTotal || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return renderBaseLayout({
    title: "PURCHASE ORDER",
    content,
    documentNumber: purchase.purchaseNumber,
    company,
  });
};

/**
 * Render Payment Receipt A4 HTML Template
 */
const renderPaymentReceiptHTML = (payment, company = COMPANY_DETAILS) => {
  const customer = payment.customerId || {};
  const words = numberToWords(payment.amountReceived || 0);

  const content = `
    <table class="info-table">
      <tr>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">RECEIVED FROM:</strong><br>
          <strong style="font-size: 14px;">${customer.businessName || "Customer"}</strong><br>
          Contact: ${customer.personName || "N/A"}<br>
          Phone: ${formatPhone(customer.contactNumber || customer.mobile || customer.phone) || "N/A"}
        </td>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">RECEIPT DETAILS:</strong><br>
          <strong>Receipt #:</strong> ${payment.receiptNumber || "N/A"}<br>
          <strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString("en-IN")}<br>
          <strong>Payment Method:</strong> ${payment.paymentMethod || "UPI"}<br>
          <strong>Reference #:</strong> ${payment.paymentReference || "N/A"}
        </td>
      </tr>
    </table>

    <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
      <div style="font-size: 14px; color: #166534; text-transform: uppercase;">Amount Received</div>
      <div style="font-size: 32px; font-weight: bold; color: #16a34a; margin: 6px 0;">₹${(payment.amountReceived || 0).toFixed(2)}</div>
      <div style="font-style: italic; color: #374151;">${words}</div>
    </div>
  `;

  return renderBaseLayout({
    title: "PAYMENT RECEIPT",
    content,
    documentNumber: payment.paymentNumber,
    company,
  });
};

/**
 * Render Delivery Challan A4 HTML Template
 */
const renderDeliveryChallanHTML = (order, company = COMPANY_DETAILS) => {
  const customer = order.customerSnapshot || order.customerId || {};
  const items = order.orderItems || [];

  const itemsRows = items
    .map(
      (item, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${item.productName || "Product"}</strong></td>
      <td style="text-align: right;">${item.quantity || 0} ${item.unit || "Kg"}</td>
      <td style="text-align: center;">[ &nbsp;&nbsp;&nbsp;&nbsp; ] Verified</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <table class="info-table">
      <tr>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">DELIVER TO:</strong><br>
          <strong style="font-size: 14px;">${customer.businessName || "Customer"}</strong><br>
          Phone: ${formatPhone(customer.contactNumber || customer.mobile || customer.phone) || "N/A"}<br>
          Address: ${customer.address || "N/A"}
        </td>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">CHALLAN DETAILS:</strong><br>
          <strong>Dispatch Date:</strong> ${new Date(order.orderDate).toLocaleDateString("en-IN")}<br>
          <strong>Assigned Vehicle:</strong> ${order.assignedVehicle || "Pending"}<br>
          <strong>Assigned Driver:</strong> ${order.assignedDriver || "Pending"}
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">#</th>
          <th style="width: 50%;">Item Description</th>
          <th style="width: 25%; text-align: right;">Dispatch Qty</th>
          <th style="width: 20%; text-align: center;">Physical Verification</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
  `;

  return renderBaseLayout({
    title: "DELIVERY CHALLAN",
    content,
    documentNumber: order.orderNumber,
    company,
  });
};

/**
 * Render Customer Statement A4 HTML Template
 */
const renderCustomerStatementHTML = (customer, invoices = [], payments = [], statement = {}, company = COMPANY_DETAILS) => {
  const invoiceRows = invoices
    .map(
      (inv) => `
    <tr>
      <td>${new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</td>
      <td><strong>${inv.invoiceNumber}</strong></td>
      <td>Tax Invoice</td>
      <td style="text-align: right;">₹${(inv.grandTotal || 0).toFixed(2)}</td>
      <td style="text-align: right;">₹${(inv.paymentSummary?.paidAmount || 0).toFixed(2)}</td>
      <td style="text-align: right; font-weight: bold; color: #dc2626;">₹${(inv.paymentSummary?.outstandingAmount || 0).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <table class="info-table">
      <tr>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">CUSTOMER STATEMENT FOR:</strong><br>
          <strong style="font-size: 14px;">${customer.businessName || "Customer"}</strong><br>
          Contact: ${customer.personName || "N/A"}<br>
          Phone: ${formatPhone(customer.contactNumber || customer.mobile || customer.phone) || "N/A"}
        </td>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">ACCOUNT SUMMARY:</strong><br>
          <strong>Total Invoiced:</strong> ₹${(statement.totalInvoiced || 0).toFixed(2)}<br>
          <strong>Total Paid:</strong> ₹${(statement.totalPaid || 0).toFixed(2)}<br>
          <strong>Outstanding Balance:</strong> <span style="font-weight: bold; color: #dc2626;">₹${(statement.totalOutstanding || 0).toFixed(2)}</span>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Invoice #</th>
          <th>Type</th>
          <th style="text-align: right;">Billed (₹)</th>
          <th style="text-align: right;">Paid (₹)</th>
          <th style="text-align: right;">Outstanding (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${invoiceRows || `<tr><td colspan="6" style="text-align: center;">No transactions found</td></tr>`}
      </tbody>
    </table>
  `;

  return renderBaseLayout({
    title: "CUSTOMER STATEMENT",
    content,
    documentNumber: customer.businessName,
    company,
  });
};

/**
 * Render Supplier Statement A4 HTML Template
 */
const renderSupplierStatementHTML = (supplier, purchases = [], statement = {}, company = COMPANY_DETAILS) => {
  const purchaseRows = purchases
    .map(
      (p) => `
    <tr>
      <td>${new Date(p.purchaseDate).toLocaleDateString("en-IN")}</td>
      <td><strong>${p.purchaseNumber}</strong></td>
      <td>Purchase Order</td>
      <td>${p.purchaseStatus}</td>
      <td style="text-align: right;">₹${(p.grandTotal || 0).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <table class="info-table">
      <tr>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">SUPPLIER STATEMENT FOR:</strong><br>
          <strong style="font-size: 14px;">${supplier.businessName || "Supplier"}</strong><br>
          Contact: ${supplier.personName || "N/A"}<br>
          Phone: ${supplier.mobile || "N/A"}
        </td>
        <td style="width: 50%;" class="info-box">
          <strong style="color: #16a34a;">LEDGER SUMMARY:</strong><br>
          <strong>Total Purchases:</strong> ₹${(statement.totalPurchased || 0).toFixed(2)}<br>
          <strong>Active Orders Count:</strong> ${purchases.length}
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>PO Number</th>
          <th>Type</th>
          <th>Status</th>
          <th style="text-align: right;">Grand Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${purchaseRows || `<tr><td colspan="5" style="text-align: center;">No purchase orders found</td></tr>`}
      </tbody>
    </table>
  `;

  return renderBaseLayout({
    title: "SUPPLIER STATEMENT",
    content,
    documentNumber: supplier.businessName,
    company,
  });
};

/**
 * Render 80mm Compact Thermal Receipt HTML Template
 */
const renderThermalReceiptHTML = (entity, type = "invoice", company = COMPANY_DETAILS) => {
  const isInvoice = type === "invoice";
  const docNumber = isInvoice ? entity.invoiceNumber : entity.receiptNumber || entity.paymentNumber;
  const docDate = new Date(entity.invoiceDate || entity.paymentDate || Date.now()).toLocaleDateString("en-IN");
  const items = entity.invoiceItems || [];

  const itemLines = items
    .map(
      (item) => `
    <tr>
      <td style="font-size: 11px;">${item.productName || item.displayNameSnapshot}</td>
      <td style="text-align: right; font-size: 11px;">${item.quantity}</td>
      <td style="text-align: right; font-size: 11px;">₹${(item.sellingPriceSnapshot || 0).toFixed(2)}</td>
      <td style="text-align: right; font-size: 11px;">₹${((item.quantity || 0) * (item.sellingPriceSnapshot || 0)).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${docNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 2mm;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 76mm;
      margin: 0 auto;
      padding: 4px;
      font-size: 11px;
      color: #000;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .line { border-bottom: 1px dashed #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
  </style>
</head>
<body onload="window.print()">

  <div class="text-center">
    <strong style="font-size: 14px;">${company.name || "PRAKRITI ERP"}</strong><br>
    ${company.address || ""}<br>
    Tel: ${company.phone || ""}<br>
    GST: ${company.gstin || ""}
  </div>

  <div class="line"></div>

  <div>
    <strong>${isInvoice ? "INVOICE" : "RECEIPT"}:</strong> ${docNumber}<br>
    <strong>DATE:</strong> ${docDate}<br>
    <strong>CUSTOMER:</strong> ${entity.customerSnapshot?.businessName || entity.customerId?.businessName || "Walk-in"}
  </div>

  <div class="line"></div>

  ${
    isInvoice
      ? `
    <table>
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="text-align: left;">ITEM</th>
          <th style="text-align: right;">QTY</th>
          <th style="text-align: right;">RATE</th>
          <th style="text-align: right;">AMT</th>
        </tr>
      </thead>
      <tbody>
        ${itemLines}
      </tbody>
    </table>
    <div class="line"></div>
    <div class="text-right" style="font-size: 14px; font-weight: bold;">
      TOTAL: ₹${(entity.grandTotal || 0).toFixed(2)}
    </div>
  `
      : `
    <div class="text-center" style="margin: 12px 0;">
      <div style="font-size: 12px;">AMOUNT RECEIVED</div>
      <div style="font-size: 20px; font-weight: bold;">₹${(entity.amountReceived || 0).toFixed(2)}</div>
      <div>Method: ${entity.paymentMethod || "UPI"}</div>
    </div>
  `
  }

  <div class="line"></div>

  <div class="text-center" style="font-size: 10px;">
    Thank you for your business!<br>
    Prakriti ERP Verified Document
  </div>

</body>
</html>`;
};

/**
 * Renders Professional Accounting-Style PDF HTML for Reports
 */
const renderReportPDFHTML = (reportTitle, reportName, reportData = {}, filterInfo = {}, company = COMPANY_DETAILS) => {
  const generatedAt = new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });
  
  // Format summary cards if present
  let summaryHtml = "";
  if (reportData.kpis && Array.isArray(reportData.kpis)) {
    summaryHtml = `
      <div style="display: flex; gap: 16px; margin-bottom: 20px;">
        ${reportData.kpis.map((kpi) => `
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
            <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">${kpi.label}</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${kpi.value}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Format table headers and rows
  const columns = reportData.columns || [{ label: "Item", key: "name" }, { label: "Value", key: "val" }];
  const rows = reportData.rows || [];

  const headersHtml = columns.map((col) => `<th style="padding: 10px; text-align: ${col.align || 'left'}; border-bottom: 2px solid #0f172a;">${col.label}</th>`).join("");
  
  const rowsHtml = rows.length > 0 ? rows.map((row, idx) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
    return `<tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
      ${columns.map((col) => `<td style="padding: 8px 10px; text-align: ${col.align || 'left'}; font-size: 11px;">${row[col.key] !== undefined ? row[col.key] : "-"}</td>`).join("")}
    </tr>`;
  }).join("") : `<tr><td colspan="${columns.length}" style="padding: 16px; text-align: center; color: #64748b;">No report records found for the selected period.</td></tr>`;

  const totalHtml = reportData.totals ? `
    <tr style="background: #e2e8f0; font-weight: bold;">
      ${columns.map((col, idx) => `<td style="padding: 10px; text-align: ${col.align || 'left'}; font-size: 11px;">${idx === 0 ? 'TOTAL' : (reportData.totals[col.key] !== undefined ? reportData.totals[col.key] : '')}</td>`).join("")}
    </tr>
  ` : "";

  const content = `
    <!-- Metadata & Filter Info -->
    <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 11px; display: flex; justify-content: space-between;">
      <div>
        <strong>Report:</strong> ${reportTitle} (${reportName})<br>
        <strong>Period / Filter:</strong> ${filterInfo.preset || "All Time"} (${filterInfo.startDate || 'Start'} - ${filterInfo.endDate || 'Present'})
      </div>
      <div style="text-align: right;">
        <strong>Generated At:</strong> ${generatedAt}<br>
        <strong>Generated By:</strong> System Admin (Prakriti ERP)
      </div>
    </div>

    ${summaryHtml}

    <!-- Data Table -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background: #f8fafc; color: #0f172a; font-size: 11px; font-weight: bold;">
          ${headersHtml}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        ${totalHtml}
      </tbody>
    </table>
  `;

  return renderBaseLayout(reportTitle, content, company);
};

module.exports = {
  COMPANY_DETAILS,
  numberToWords,
  generateQRCodeSVG,
  renderBaseLayout,
  renderInvoiceHTML,
  renderPurchaseOrderHTML,
  renderPaymentReceiptHTML,
  renderDeliveryChallanHTML,
  renderCustomerStatementHTML,
  renderSupplierStatementHTML,
  renderThermalReceiptHTML,
  renderReportPDFHTML,
};
