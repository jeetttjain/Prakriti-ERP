const Customer = require("../../../models/Customer");
const CreditProfile = require("../../../models/CreditProfile");
const LoyaltyAccount = require("../../../models/LoyaltyAccount");
const CustomerHealth = require("../../../models/CustomerHealth");
const activityEngine = require("../activities/activityEngine");
const eventPublisher = require("../../events/eventPublisher");

class CustomerManager {
  async initializeDefaults() {
    try {
      await Customer.collection.dropIndexes().catch(() => {});
    } catch (e) {}

    const count = await Customer.countDocuments();
    if (count > 0) return;

    const initialCustomers = [
      { customerCode: "CUST-B2B-01", companyName: "Jaipur Agro Mart Ltd", contactName: "Rajesh Sharma", email: "rajesh@jaipuragro.com", phone: "+919829055555", mobile: "+919829055555", gstin: "08AAAAA0000A1Z5", segment: "VIP", creditLimit: 500000, outstandingAmount: 45000 },
      { customerCode: "CUST-B2C-01", companyName: "Ramesh Organic Stores", contactName: "Ramesh Kumar", email: "ramesh@organic.org", phone: "+919829066666", mobile: "+919829066666", gstin: "08BBBBB1111B1Z2", segment: "Wholesale", creditLimit: 200000, outstandingAmount: 12000 },
    ];

    await Customer.insertMany(initialCustomers);
  }

  async listCustomers() {
    await this.initializeDefaults();
    return Customer.find({}).sort({ customerCode: 1 });
  }

  async createCustomer(data) {
    const customerCode = `CUST-${Date.now().toString().slice(-4)}`;
    const cust = await Customer.create({ customerCode, mobile: data.mobile || data.phone, contactNumber: data.phone, ...data });

    // Create default credit, loyalty, and health profiles
    await CreditProfile.create({ customerCode, creditLimit: data.creditLimit || 200000 }).catch(() => {});
    await LoyaltyAccount.create({ customerCode, tier: "Silver", pointsBalance: 500 }).catch(() => {});
    await CustomerHealth.create({ customerCode, healthScore: 90, riskLevel: "Low", factors: ["New Account Onboarded"] }).catch(() => {});

    await activityEngine.logActivity(customerCode, "Note", "Customer Account Created", `Account onboarded for ${cust.companyName}`);
    eventPublisher.publish("CUSTOMER_CREATED", { customerCode, companyName: cust.companyName }, { producerModule: "ECXP" }).catch(() => {});

    return cust;
  }
}

module.exports = new CustomerManager();
