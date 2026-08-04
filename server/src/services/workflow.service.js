const notificationService = require("./notification.service");
const documentService = require("./document.service");
const exportService = require("./export.service");
const auditLogService = require("./auditLog.service");
const inventoryService = require("./inventory.service");
const reportService = require("./report.service");

/**
 * Action Plugin Registry
 * Maps action types to specialized domain service handlers.
 */
const ACTION_PLUGINS = {
  SEND_NOTIFICATION: async (config, payload) => {
    return notificationService.createNotification({
      title: config.title || "Automation Alert",
      message: config.message || "Automation action triggered.",
      type: config.type || "INFO",
      recipient: config.recipient || "SYSTEM",
    });
  },

  SEND_WHATSAPP: async (config, payload) => {
    return notificationService.sendWhatsAppNotification({
      recipientPhone: config.phone || payload.phone || "+919876543210",
      message: config.message || "Prakriti ERP Automated Update",
    });
  },

  SEND_EMAIL: async (config, payload) => {
    return notificationService.sendEmailNotification({
      to: config.email || payload.email || "admin@prakritiveg.com",
      subject: config.subject || "Automation Notification",
      body: config.message || "Automated update from Prakriti ERP.",
    });
  },

  SEND_SMS: async (config, payload) => {
    return notificationService.sendSMSNotification({
      to: config.phone || payload.phone || "+919876543210",
      message: config.message || "Prakriti ERP Alert",
    });
  },

  GENERATE_REPORT: async (config, payload) => {
    const reportName = config.reportName || "sales-summary";
    return documentService.generateReportExport(reportName, config.format || "excel", {});
  },

  GENERATE_PDF: async (config, payload) => {
    const docId = config.documentId || payload.entityId || payload._id;
    if (config.documentType === "invoice") {
      return documentService.generateInvoicePDF(docId);
    }
    return documentService.generatePurchaseOrderPDF(docId);
  },

  CREATE_AUDIT_ENTRY: async (config, payload) => {
    return auditLogService.logEvent({
      module: config.module || "Automation",
      action: config.action || "Automation Action Executed",
      actionType: "CREATE",
      description: config.description || "Automated workflow action completed.",
      afterData: payload,
    });
  },

  RUN_CUSTOM_SCRIPT: async (config, payload) => {
    return { status: "EXECUTED", message: `Custom script ${config.scriptName || 'default'} finished.` };
  },

  BACKUP_DATABASE: async (config, payload) => {
    return { status: "COMPLETED", message: "Database snapshot backup simulated successfully." };
  },
};

/**
 * Registers new custom action plugin without modifying workflow engine.
 */
const registerPlugin = (actionType, handlerFn) => {
  ACTION_PLUGINS[actionType] = handlerFn;
};

/**
 * Orchestrates rule action execution with Action-Level Failure Isolation.
 * Failure of one action logs an error and continues remaining independent actions.
 * @param {Array<{ actionType: string, config: object }>} actions List of actions
 * @param {Object} payload Event / Entity payload
 * @returns {Promise<Array<Object>>} Action execution result outputs
 */
const executeWorkflow = async (actions = [], payload = {}) => {
  const results = [];

  for (const act of actions) {
    const handler = ACTION_PLUGINS[act.actionType];
    if (!handler) {
      results.push({
        actionType: act.actionType,
        status: "FAILED",
        error: `Unknown action plugin type: ${act.actionType}`,
      });
      continue;
    }

    try {
      const output = await handler(act.config || {}, payload);
      results.push({
        actionType: act.actionType,
        status: "SUCCESS",
        output,
      });
    } catch (err) {
      // Failure isolation: log error for this action and continue remaining actions
      results.push({
        actionType: act.actionType,
        status: "FAILED",
        error: err.message || "Action execution error",
      });
    }
  }

  return results;
};

module.exports = {
  ACTION_PLUGINS,
  registerPlugin,
  executeWorkflow,
};
