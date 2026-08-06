require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const { normalizePhone, formatPhone, validatePhone, comparePhone, escapeRegex } = require("./src/utils/phoneUtils");
const customerManager = require("./src/core/crm/customers/customerManager");
const customerController = require("./src/controllers/customer.controller");
const Customer = require("./src/models/Customer");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Phone Normalization Utility Unit Tests ---");
    const testCases = [
      { input: "+91 98290 11111", expected: "9829011111" },
      { input: "+919829011111", expected: "9829011111" },
      { input: "91-9829011111", expected: "9829011111" },
      { input: "919829011111", expected: "9829011111" },
      { input: "09829011111", expected: "9829011111" },
      { input: "98290 11111", expected: "9829011111" },
    ];

    for (const tc of testCases) {
      const normalized = normalizePhone(tc.input);
      if (normalized !== tc.expected) {
        throw new Error(`Normalization failed for ${tc.input}: Expected ${tc.expected}, got ${normalized}`);
      }
      console.log(`  ✅ normalizePhone("${tc.input}") ➔ "${normalized}"`);
    }

    console.log("\n--- TEST 2: Phone Formatting & Validation ---");
    const formatted = formatPhone("9829011111");
    if (formatted !== "+91 9829011111") throw new Error(`Format failed: ${formatted}`);
    console.log(`  ✅ formatPhone("9829011111") ➔ "${formatted}"`);

    const isValid = validatePhone("+91-9829011111");
    if (!isValid) throw new Error("Validation failed for valid number");
    console.log(`  ✅ validatePhone("+91-9829011111") ➔ ${isValid}`);

    console.log("\n--- TEST 3: Safe Regex Escaping ---");
    const dangerousInput = "+919829011111";
    const escaped = escapeRegex(dangerousInput);
    console.log(`  ✅ escapeRegex("${dangerousInput}") ➔ "${escaped}"`);
    
    // Creating RegExp with escaped string must NOT throw quantifier error
    const safeRegex = new RegExp(escaped, "i");
    console.log(`  ✅ RegExp created cleanly: ${safeRegex}`);

    console.log("\n--- TEST 4: Customer Creation & DB Normalization ---");
    const testPhoneRaw = "+91 98290 88776";
    const testPhoneNormalized = "9829088776";

    // Clean up if exists
    await Customer.deleteMany({ phone: testPhoneNormalized });

    const customer = await customerManager.createCustomer({
      companyName: "Safe Search Foods",
      contactName: "Vikram Singh",
      email: "vikram@safesearch.com",
      phone: testPhoneRaw,
      mobile: testPhoneRaw,
      whatsappNumber: testPhoneRaw,
    });

    console.log(`  ✅ Customer Created! Stored Phone in DB: "${customer.phone}"`);
    if (customer.phone !== testPhoneNormalized) {
      throw new Error(`Expected normalized phone in DB "${testPhoneNormalized}", but found "${customer.phone}"`);
    }

    console.log("\n--- TEST 5: Duplicate Prevention Across Variants ---");
    const duplicateVariants = ["+919829088776", "91-9829088776", "09829088776"];
    for (const dupPhone of duplicateVariants) {
      try {
        await customerManager.createCustomer({
          companyName: "Duplicate Test Store",
          contactName: "Duplicate User",
          email: "dup@test.com",
          phone: dupPhone,
        });
        throw new Error(`Failed to reject duplicate phone variant: ${dupPhone}`);
      } catch (err) {
        if (err.message.includes("Failed to reject")) throw err;
        console.log(`  ✅ Duplicate Phone Variant "${dupPhone}" Rejected: ${err.message}`);
      }
    }

    console.log("\n--- TEST 6: Safe Search by All Phone Variants & Regex Input ---");
    const searchVariants = ["9829088776", "+919829088776", "91-9829088776", "98290 88776", "+91"];

    for (const q of searchVariants) {
      const mockReq = { query: { q } };
      let resData = null;
      const mockRes = {
        status: () => mockRes,
        json: (data) => { resData = data; return mockRes; }
      };

      await customerController.searchCustomers(mockReq, mockRes);
      if (!resData || !resData.success) {
        throw new Error(`Search failed for query "${q}"`);
      }
      console.log(`  ✅ Safe Search Query "${q}" Succeeded! Found Matches: ${resData.data.length}`);
    }

    console.log("\n🎉 ALL CUSTOMER PHONE NORMALIZATION & SAFE SEARCH TESTS PASSED SUCCESSFULLY!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🍃 MongoDB Connection closed.");
    process.exit(0);
  }
}

runTests();
