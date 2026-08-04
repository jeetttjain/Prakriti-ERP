/**
 * Parses and replaces bracket parameters inside text messages.
 * @param {string} templateString Input text with brackets
 * @param {Object} [variables={}] Custom key-value variables
 * @returns {string} Fully parsed message body
 */
const parseTemplate = (templateString, variables = {}) => {
  if (!templateString) return "";
  let message = templateString;

  Object.keys(variables).forEach((key) => {
    const val = variables[key];
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    message = message.replace(regex, val !== undefined && val !== null ? String(val) : "");
  });

  return message;
};

/**
 * Returns a list of default system message templates.
 */
const getSystemTemplates = () => {
  return [
    { type: "Order Created", subject: "Order Created", content: "Hi {{customer}}, your order {{order}} has been successfully created on {{date}}." },
    { type: "Order Confirmed", subject: "Order Confirmed", content: "Hi {{customer}}, your order {{order}} has been confirmed." },
    { type: "Order Delivered", subject: "Order Delivered", content: "Hi {{customer}}, your order {{order}} has been delivered on {{date}}." },
    { type: "Invoice Generated", subject: "Invoice Generated", content: "Hi {{customer}}, invoice {{invoice}} for amount {{amount}} has been generated." },
    { type: "Payment Received", subject: "Payment Received", content: "Hi {{customer}}, we have received your payment of {{amount}} for transaction {{payment}}." },
    { type: "Outstanding Reminder", subject: "Outstanding Reminder", content: "Hi {{customer}}, this is a reminder that invoice {{invoice}} has an outstanding balance of {{amount}}." },
    { type: "Purchase Received", subject: "Purchase Received", content: "Purchase replenishment order {{order}} has been marked as received on {{date}}." },
    { type: "Inventory Low", subject: "Low Stock Alert", content: "Product catalog item {{product}} is below safe minimum limits." },
    { type: "Inventory Out Of Stock", subject: "Out Of Stock Alert", content: "Product catalog item {{product}} is out of stock." },
    { type: "Customer Registered", subject: "Welcome Customer", content: "Welcome {{customer}} to Prakriti Vegetable Wholesale!" },
    { type: "Supplier Registered", subject: "Welcome Supplier Partner", content: "Supplier partner account {{supplier}} registered successfully." },
    { type: "System Alert", subject: "System Maintenance Notification", content: "Prakriti wholesale ERP system notification: {{message}}" }
  ];
};

module.exports = {
  parseTemplate,
  getSystemTemplates,
};
