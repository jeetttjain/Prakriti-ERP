const thresholds = require("../../config/biThresholds");

const supplierRules = [
  {
    ruleId: "SUPP_DELIVERY_DELAY",
    name: "Supplier Lead Time Delay Spike",
    category: "Supplier",
    severity: "Warning",
    priority: "Medium",
    evaluate: (data) => {
      const delayedSuppliers = (data.delayedSuppliers || []).map((s) => ({
        supplierId: s._id,
        businessName: s.businessName || "Produce Supplier",
        delayIncreasePct: s.delayIncreasePct || 18,
      }));
      return { triggered: delayedSuppliers.length > 0, suppliers: delayedSuppliers };
    },
    generateRecommendation: (result) => {
      const supp = result.suppliers[0];
      return {
        recId: `REC-SUPP-DELAY-${supp.supplierId || Date.now()}`,
        ruleId: "SUPP_DELIVERY_DELAY",
        category: "Supplier",
        severity: "Warning",
        priority: "Medium",
        title: `Supplier ${supp.businessName} delivery delay increased by ${supp.delayIncreasePct}%`,
        description: `Average shipment delivery time for ${supp.businessName} has degraded over recent purchase orders.`,
        reason: "Supply chain fulfillment delays in farm-gate dispatch or transit.",
        suggestedAction: "Re-negotiate SLA terms or diversify stock procurement across secondary regional suppliers.",
        estimatedImpact: "Mitigates warehouse stockout risks during peak morning wholesale fulfillment.",
        navigationTarget: { path: `/suppliers/${supp.supplierId}`, label: "Inspect Supplier SLA" },
      };
    },
  },
];

module.exports = supplierRules;
