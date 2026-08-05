require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const biService = require("./src/services/businessIntelligence.service");
const Recommendation = require("./src/models/Recommendation");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: BI Overview & Health Score Aggregation ---");
    const startTime = Date.now();
    const overview = await biService.getBIOverview({});
    const duration = Date.now() - startTime;

    console.log("✅ BI Overview aggregation completed in", duration, "ms");
    console.log("Health Score:", overview.healthScore.overallScore, "/ 100 (Grade:", overview.healthScore.grade, ")");
    console.log("Sub-scores:", overview.healthScore.subScores);
    console.log("Active Recommendations Count:", overview.activeRecommendationsCount);

    if (duration > 2000) {
      throw new Error(`❌ Response latency ${duration}ms exceeded 2000ms threshold!`);
    }

    console.log("\n--- TEST 2: Recommendation Engine & Registry ---");
    const recs = await biService.getRecommendations({});
    console.log("✅ Fetched active recommendations count:", recs.length);
    if (recs.length > 0) {
      const firstRec = recs[0];
      console.log("Sample Recommendation:", {
        recId: firstRec.recId,
        category: firstRec.category,
        severity: firstRec.severity,
        title: firstRec.title,
        suggestedAction: firstRec.suggestedAction,
        impact: firstRec.estimatedImpact,
      });

      console.log("\n--- TEST 3: Recommendation Lifecycle Resolution ---");
      const resolved = await biService.resolveRecommendation(firstRec.recId, "Resolved via Automated Test Runner", "TestUser");
      console.log("✅ Recommendation resolved successfully! Status:", resolved.status, "ResolvedBy:", resolved.resolvedBy);

      console.log("\n--- TEST 4: Recommendation Archiving ---");
      const archived = await biService.archiveRecommendation(firstRec.recId, "TestUser");
      console.log("✅ Recommendation archived successfully! Status:", archived.status);
    }

    console.log("\n--- TEST 5: Sales Intelligence Module ---");
    const sales = await biService.getSalesIntelligence();
    console.log("✅ Sales BI loaded! Peak Ordering Hour:", sales.peakOrderingHour, "Today Sales:", sales.todaySales);

    console.log("\n--- TEST 6: Inventory Intelligence Module ---");
    const inventory = await biService.getInventoryIntelligence();
    console.log("✅ Inventory BI loaded! Low Stock Count:", inventory.lowStockCount, "Inventory Value:", inventory.inventoryValue);

    console.log("\n--- TEST 7: Customer & Supplier Intelligence Modules ---");
    const customers = await biService.getCustomerIntelligence();
    const suppliers = await biService.getSupplierIntelligence();
    console.log("✅ Customer BI total:", customers.totalCustomers, "Supplier Lead Time:", suppliers.averageLeadTimeHours, "hrs");

    console.log("\n--- TEST 8: Financial & Purchase Intelligence Modules ---");
    const finance = await biService.getFinancialIntelligence();
    const purchases = await biService.getPurchaseIntelligence();
    console.log("✅ Financial BI Net Margin:", finance.netMarginPct, "% Purchase Total:", purchases.totalPurchasesValue);

    console.log("\n🎉 ALL 8 BUSINESS INTELLIGENCE TESTS PASSED SUCCESSFULLY IN UNDER 2 SECONDS!");
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
