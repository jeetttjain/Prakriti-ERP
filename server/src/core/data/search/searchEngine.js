const EnterpriseFile = require("../../../models/EnterpriseFile");

class SearchEngine {
  /**
   * Executes full-text & metadata global search across EDP files.
   */
  async search(queryText = "", filters = {}) {
    const query = { isDeleted: false };

    if (queryText) {
      const regex = new RegExp(queryText, "i");
      query.$or = [
        { filename: regex },
        { originalName: regex },
        { module: regex },
        { tags: regex },
        { owner: regex },
      ];
    }

    if (filters.module) query.module = filters.module;
    if (filters.classification) query.securityClassification = filters.classification;
    if (filters.mimeType) query.mimeType = new RegExp(filters.mimeType, "i");

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
