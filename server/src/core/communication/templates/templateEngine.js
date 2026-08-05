const CommunicationTemplate = require("../../../models/CommunicationTemplate");

class TemplateEngine {
  /**
   * Renders body and subject templates with variables and locale formatting.
   */
  render(templateText, variables = {}, locale = "en-IN") {
    if (!templateText) return "";

    let rendered = templateText;
    for (const [key, val] of Object.entries(variables)) {
      let formattedVal = val;
      // Locale currency formatting if number
      if (typeof val === "number" && key.toLowerCase().includes("amount")) {
        formattedVal = new Intl.NumberFormat(locale, { style: "currency", currency: "INR" }).format(val);
      }
      rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), String(formattedVal));
    }
    return rendered;
  }

  /**
   * Fetches template document or returns fallback text.
   */
  async getAndRender(templateId, variables = {}, language = "en") {
    const tmpl = await CommunicationTemplate.findOne({ templateId, language, status: "Approved" });
    if (!tmpl) {
      // Fallback to default rendering
      return {
        subject: variables.subject || "Notification",
        body: variables.body || `Notification regarding ${variables.entityId || "your account"}.`,
        category: "Transactional",
      };
    }

    return {
      subject: this.render(tmpl.subjectTemplate, variables),
      body: this.render(tmpl.bodyTemplate, variables),
      category: tmpl.category,
      fallbackChannel: tmpl.fallbackChannel,
    };
  }
}

module.exports = new TemplateEngine();
