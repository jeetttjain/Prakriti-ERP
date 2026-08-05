const salesRules = require("./salesRules");
const inventoryRules = require("./inventoryRules");
const customerRules = require("./customerRules");
const supplierRules = require("./supplierRules");
const financialRules = require("./financialRules");
const purchaseRules = require("./purchaseRules");
const { calculateBusinessHealthScore } = require("./healthScoreRules");

class RuleEngine {
  constructor() {
    this.rules = [
      ...salesRules,
      ...inventoryRules,
      ...customerRules,
      ...supplierRules,
      ...financialRules,
      ...purchaseRules,
    ];
  }

  /**
   * Register custom or plugin rules dynamically.
   */
  registerRule(rule) {
    if (!rule.ruleId || typeof rule.evaluate !== "function") {
      throw new Error("Invalid rule format. Must contain ruleId and evaluate function.");
    }
    this.rules.push(rule);
  }

  /**
   * Evaluate all registered business rules against aggregation data context.
   */
  evaluateAll(context = {}) {
    const recommendations = [];

    for (const rule of this.rules) {
      try {
        const evalResult = rule.evaluate(context);
        if (evalResult && evalResult.triggered) {
          const rec = rule.generateRecommendation(evalResult);
          recommendations.push(rec);
        }
      } catch (err) {
        console.error(`Error evaluating rule ${rule.ruleId}:`, err.message);
      }
    }

    return recommendations;
  }
}

const instance = new RuleEngine();

module.exports = {
  ruleEngine: instance,
  calculateBusinessHealthScore,
};
