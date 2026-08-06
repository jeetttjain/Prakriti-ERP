const Customer = require("../../../models/Customer");
const CreditProfile = require("../../../models/CreditProfile");
const LoyaltyAccount = require("../../../models/LoyaltyAccount");
const CustomerHealth = require("../../../models/CustomerHealth");
const activityEngine = require("../activities/activityEngine");
const eventPublisher = require("../../events/eventPublisher");
const { normalizePhone } = require("../../../utils/phoneUtils");

class CustomerManager {
  async initializeDefaults() {
    try {
      await Customer.collection.dropIndexes().catch(() => {});
    } catch (e) {}

    const count = await Customer.countDocuments();
    if (count > 0) return;

    const initialCustomers = [
      { customerCode: "CUST-B2B-01", companyName: "Jaipur Agro Mart Ltd", contactName: "Rajesh Sharma", email: "rajesh@jaipuragro.com", phone: "9829055555", mobile: "9829055555", contactNumber: "9829055555", whatsappNumber: "9829055555", gstin: "08AAAAA0000A1Z5", segment: "VIP", creditLimit: 500000, outstandingAmount: 45000 },
      { customerCode: "CUST-B2C-01", companyName: "Ramesh Organic Stores", contactName: "Ramesh Kumar", email: "ramesh@organic.org", phone: "9829066666", mobile: "9829066666", contactNumber: "9829066666", whatsappNumber: "9829066666", gstin: "08BBBBB1111B1Z2", segment: "Wholesale", creditLimit: 200000, outstandingAmount: 12000 },
    ];

    await Customer.insertMany(initialCustomers);
  }

  async listCustomers() {
    await this.initializeDefaults();
    return Customer.find({}).sort({ customerCode: 1 });
  }

  async createCustomer(data) {
    const rawPhone = data.phone || data.mobile || data.contactNumber;
    const normalizedPhone = normalizePhone(rawPhone);
    const normalizedWhatsApp = normalizePhone(data.whatsappNumber || normalizedPhone);

    if (normalizedPhone) {
      const existing = await Customer.findOne({
        $or: [
          { phone: normalizedPhone },
          { mobile: normalizedPhone },
          { contactNumber: normalizedPhone },
          { whatsappNumber: normalizedPhone },
        ],
      });
      if (existing) {
        throw new Error(`Customer with phone number ${normalizedPhone} already exists.`);
      }
    }

    const customerCode = `CUST-${Date.now().toString().slice(-4)}`;
    const cust = await Customer.create({
      customerCode,
      phone: normalizedPhone,
      mobile: normalizedPhone,
      contactNumber: normalizedPhone,
      whatsappNumber: normalizedWhatsApp,
      ...data,
    });

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
