const CustomerContract = require("../../../models/CustomerContract");

class ContractManager {
  async listContracts(customerCode) {
    const count = await CustomerContract.countDocuments();
    if (count === 0) {
      await CustomerContract.create([
        { contractId: "CNT-2026-01", customerCode: "CUST-B2B-01", title: "Annual Organic Oil Supply Agreement", contractValue: 1200000, status: "Active" },
      ]);
    }

    let contracts = await CustomerContract.find(customerCode ? { customerCode } : {}).sort({ createdAt: -1 });
    if (customerCode && contracts.length === 0) {
      const newContract = await this.createContract(customerCode, "Annual Supply Agreement", 500000);
      contracts = [newContract];
    }
    return contracts;
  }

  async createContract(customerCode, title, contractValue) {
    const contractId = `CNT-${Date.now().toString().slice(-4)}`;
    return CustomerContract.create({
      contractId,
      customerCode,
      title,
      contractValue,
      status: "Active",
    });
  }
}

module.exports = new ContractManager();
