const SystemModule = require("../../../models/SystemModule");

class ModuleRegistry {
  async initializeDefaults() {
    const count = await SystemModule.countDocuments();
    if (count > 0) return;

    const defaultModules = [
      { moduleId: "MOD-AUTOMATION", name: "Automation Core & Event Bus Engine", group: "Core", dependencies: [] },
      { moduleId: "MOD-COMMUNICATION", name: "Omnichannel Communication Platform", group: "Communication", dependencies: ["MOD-AUTOMATION"] },
      { moduleId: "MOD-EDP", name: "Enterprise Data Platform (EDP)", group: "Data", dependencies: ["MOD-AUTOMATION"] },
      { moduleId: "MOD-IAM", name: "Identity & Access Platform (IAM)", group: "Security", dependencies: ["MOD-AUTOMATION"] },
      { moduleId: "MOD-BI", name: "Business Intelligence & Analytics Engine", group: "Analytics", dependencies: ["MOD-AUTOMATION", "MOD-EDP"] },
      { moduleId: "MOD-OBSERVABILITY", name: "Enterprise Observability Platform (EOP)", group: "Core", dependencies: ["MOD-AUTOMATION"] },
      { moduleId: "MOD-FINANCE", name: "Enterprise Finance & Accounting Platform (EFAP)", group: "Finance", dependencies: ["MOD-AUTOMATION", "MOD-IAM"] },
      { moduleId: "MOD-SUPPLYCHAIN", name: "Multi-Branch & Supply Chain Platform (EMSCP)", group: "SupplyChain", dependencies: ["MOD-AUTOMATION", "MOD-FINANCE"] },
    ];

    await SystemModule.insertMany(defaultModules);
  }

  async listModules() {
    await this.initializeDefaults();
    return SystemModule.find({}).sort({ moduleId: 1 });
  }
}

module.exports = new ModuleRegistry();
