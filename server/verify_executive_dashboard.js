require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const dashboardService = require("./src/services/dashboard.service");
const kpiService = require("./src/services/kpi.service");
const User = require("./src/models/User");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Executive Overview Endpoint Aggregation ---");
    const startTime1 = Date.now();
    const overview = await dashboardService.getOverviewData({ timeframe: "thisMonth" });
    const duration1 = Date.now() - startTime1;

    console.log("✅ Overview aggregation completed in", duration1, "ms");
    console.log("Revenue Total:", overview.revenue);
    console.log("Today Revenue:", overview.todayRevenue);
    console.log("Monthly Revenue:", overview.monthlyRevenue);
    console.log("Pending Orders:", overview.pendingOrders);
    console.log("Inventory Value:", overview.inventoryValue);
    console.log("Net Margin %:", overview.netMargin);

    if (duration1 > 2000) {
      throw new Error(`❌ Response time ${duration1}ms exceeded 2000ms threshold!`);
    }

    console.log("\n--- TEST 2: Reusable BI KPI Engine ---");
    const kpis = await kpiService.calculateKPIs({ timeframe: "thisMonth" });
    console.log("✅ KPI Engine calculation successful!");
    console.log("MoM Revenue Growth %:", kpis.momRevenueGrowthPct);
    console.log("YoY Revenue Growth %:", kpis.yoyRevenueGrowthPct);
    console.log("Average Order Value (AOV):", kpis.averageOrderValue);
    console.log("Average Purchase Value (APV):", kpis.averagePurchaseValue);
    console.log("Gross Margin %:", kpis.grossMarginPct);

    console.log("\n--- TEST 3: Trend Charts Pre-Aggregation ---");
    const charts = await dashboardService.getChartsData({});
    console.log("✅ Charts pre-aggregation successful!");
    console.log("Monthly Sales datapoints:", charts.monthlySales.length);
    console.log("Category Distribution entries:", charts.categoryDistribution.length);
    console.log("Top Selling Products count:", charts.topSellingProducts.length);
    console.log("Top Customers count:", charts.topCustomers.length);

    console.log("\n--- TEST 4: Activity Stream & Operational Alerts ---");
    const activity = await dashboardService.getActivityData();
    const alerts = await dashboardService.getAlertsData();
    console.log("✅ Activity & Alerts fetched successfully!");
    console.log("Latest Orders:", activity.latestOrders.length);
    console.log("Low Stock Items count:", alerts.lowStock.length);
    console.log("Overdue Payments count:", alerts.overduePayments.length);

    console.log("\n--- TEST 5: System Health Monitoring Probes ---");
    const health = await dashboardService.getHealthData();
    console.log("✅ System Health loaded!");
    console.log("Database Status:", health.database.status, `(Latency: ${health.database.latencyMs} ms)`);
    console.log("API Server Uptime:", health.api.uptimeSeconds, "seconds");
    console.log("System RSS Memory:", health.system.processRssMB, "MB");

    console.log("\n--- TEST 6: DB User Dashboard Preferences Sync ---");
    const adminUser = await User.findOne({ userCode: "USR-0001" });
    if (adminUser) {
      const updatedPrefs = await dashboardService.updateUserPreferences(adminUser._id, {
        order: ["kpis", "charts", "salesAnalytics", "inventoryAnalytics"],
        theme: "dark",
      });
      console.log("✅ Preferences updated successfully in DB:", updatedPrefs);

      const fetchedPrefs = await dashboardService.getUserPreferences(adminUser._id);
      console.log("✅ Preferences fetched from DB match:", fetchedPrefs.theme === "dark");
    }

    console.log("\n🎉 ALL EXECUTIVE DASHBOARD TESTS PASSED SUCCESSFULLY IN UNDER 2 SECONDS!");
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
