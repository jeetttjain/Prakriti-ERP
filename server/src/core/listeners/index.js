const registerOrderListeners = require("./orderListener");
const registerInvoiceListeners = require("./invoiceListener");
const registerPaymentListeners = require("./paymentListener");
const registerInventoryListeners = require("./inventoryListener");
const registerPurchaseListeners = require("./purchaseListener");
const registerCustomerListeners = require("./customerListener");
const registerSupplierListeners = require("./supplierListener");
const registerUserListeners = require("./userListener");
const registerSystemListeners = require("./systemListener");

const initAllListeners = () => {
  registerOrderListeners();
  registerInvoiceListeners();
  registerPaymentListeners();
  registerInventoryListeners();
  registerPurchaseListeners();
  registerCustomerListeners();
  registerSupplierListeners();
  registerUserListeners();
  registerSystemListeners();
  console.log("⚡ All ERP Core Event Bus Listeners initialized successfully.");
};

module.exports = initAllListeners;
