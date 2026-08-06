const EnterpriseFile = require("../../../models/EnterpriseFile");
const { escapeRegex } = require("../../../utils/phoneUtils");

class SearchEngine {
  /**
   * Executes full-text & metadata global search across EDP files.
   */
  async search(queryText = "", filters = {}) {
    const query = { isDeleted: false };

    if (queryText) {
      const safeRegex = new RegExp(escapeRegex(queryText), "i");
      query.$or = [
        { filename: safeRegex },
        { originalName: safeRegex },
        { module: safeRegex },
        { tags: safeRegex },
        { owner: safeRegex },
      ];
    }

    if (filters.module) query.module = filters.module;
    if (filters.classification) query.securityClassification = filters.classification;
    if (filters.mimeType) query.mimeType = new RegExp(escapeRegex(filters.mimeType), "i");

    const files = await EnterpriseFile.find(query).sort({ createdAt: -1 }).limit(50);
    return {
      queryText,
      totalMatches: files.length,
      files,
      suggestions: ["Invoices", "Purchase Orders", "GST Reports", "Customer Statements"],
    };
  }
}

module.exports = new SearchEngine();
