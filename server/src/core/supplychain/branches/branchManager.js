const Branch = require("../../../models/Branch");

class BranchManager {
  async initializeDefaults() {
    const count = await Branch.countDocuments();
    if (count > 0) return;

    await Branch.create([
      { branchCode: "BR-HQ-01", name: "Corporate Headquarters - Jaipur", region: "North", managerName: "Jeet Jain", status: "Active" },
      { branchCode: "BR-DEL-01", name: "Delhi Regional Hub", region: "North", managerName: "Rajesh Kumar", status: "Active" },
    ]);
  }

  async listBranches() {
    await this.initializeDefaults();
    return Branch.find({});
  }
}

module.exports = new BranchManager();
