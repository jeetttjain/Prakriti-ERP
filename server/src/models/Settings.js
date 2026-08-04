const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // Company Information
    companyName: { type: String, default: "Prakriti Foods" },
    logo: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    businessType: { type: String, default: "Vegetable Supplier" },

    // Business Settings
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
    financialYear: { type: String, default: "2026-2027" },

    // Catalog Modules
    vegetablesEnabled: { type: Boolean, default: true },
    fruitsEnabled: { type: Boolean, default: true },
    dairyEnabled: { type: Boolean, default: true },
    groceryEnabled: { type: Boolean, default: true },
    beveragesEnabled: { type: Boolean, default: true },
    packagingEnabled: { type: Boolean, default: true },

    // Order Settings
    defaultPaymentCycle: { type: String, default: "COD" },
    allowNegativeStock: { type: Boolean, default: false },
    allowPartialPayments: { type: Boolean, default: true },
    autoReserveInventory: { type: Boolean, default: true },

    // Invoice Settings
    invoicePrefix: { type: String, default: "INV" },
    paymentPrefix: { type: String, default: "PAY" },
    purchasePrefix: { type: String, default: "PUR" },
    supplierPrefix: { type: String, default: "SPL" },

    // Notification Settings
    whatsappEnabled: { type: Boolean, default: false },
    emailEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false },

    // System Settings
    maintenanceMode: { type: Boolean, default: false },
    debugMode: { type: Boolean, default: false },

    // Feature Flags
    features: {
      purchaseModuleEnabled: { type: Boolean, default: true },
      inventoryModuleEnabled: { type: Boolean, default: true },
      invoiceModuleEnabled: { type: Boolean, default: true },
      paymentModuleEnabled: { type: Boolean, default: true },
      reportsModuleEnabled: { type: Boolean, default: true },
      dashboardModuleEnabled: { type: Boolean, default: true },
      automationModuleEnabled: { type: Boolean, default: false },
      aiModuleEnabled: { type: Boolean, default: false },
      customerPortalEnabled: { type: Boolean, default: false },
    },

    // User Preferences
    preferences: {
      defaultTheme: { type: String, default: "light" },
      defaultLanguage: { type: String, default: "en" },
      defaultDateFormat: { type: String, default: "DD/MM/YYYY" },
      defaultTimeFormat: { type: String, default: "12h" },
    },

    // System Metadata
    systemVersion: { type: String, default: "1.0.0" },
    lastUpdated: { type: Date, default: Date.now },

    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
