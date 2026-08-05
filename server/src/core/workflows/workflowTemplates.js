/**
 * Pre-packaged Workflow Templates for Prakriti ERP
 */
const TEMPLATES = [
  {
    templateId: "TMPL_PAYMENT_REMINDER",
    name: "Payment Overdue Follow-up",
    description: "Triggers notification when an invoice passes due date.",
    triggerEvent: "PAYMENT_OVERDUE",
    steps: [
      { stepId: "S1", type: "Trigger", config: { event: "PAYMENT_OVERDUE" } },
      { stepId: "S2", type: "Condition", config: { field: "dueAmount", operator: "GREATER_THAN", value: 1000 } },
      { stepId: "S3", type: "Action", config: { actionType: "SEND_ALERT", channel: "INTERNAL" } },
      { stepId: "S4", type: "Finish", config: {} },
    ],
  },
  {
    templateId: "TMPL_LOW_STOCK_ALERT",
    name: "Low Stock Purchase Draft",
    description: "Generates reorder alert when stock depletes below threshold.",
    triggerEvent: "LOW_STOCK",
    steps: [
      { stepId: "S1", type: "Trigger", config: { event: "LOW_STOCK" } },
      { stepId: "S2", type: "Condition", config: { field: "daysLeft", operator: "LESS_THAN", value: 3 } },
      { stepId: "S3", type: "Action", config: { actionType: "CREATE_PURCHASE_DRAFT" } },
      { stepId: "S4", type: "Finish", config: {} },
    ],
  },
  {
    templateId: "TMPL_DAILY_BACKUP",
    name: "Daily Automated System Backup",
    description: "Runs scheduled database backup daily.",
    triggerEvent: "BACKUP_COMPLETED",
    steps: [
      { stepId: "S1", type: "Trigger", config: { event: "BACKUP_COMPLETED" } },
      { stepId: "S2", type: "Action", config: { actionType: "AUDIT_LOG", message: "Daily backup completed" } },
      { stepId: "S3", type: "Finish", config: {} },
    ],
  },
];

module.exports = TEMPLATES;
