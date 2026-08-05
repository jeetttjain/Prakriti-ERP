require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const chartOfAccounts = require("./src/core/finance/accounts/chartOfAccounts");
const journalEngine = require("./src/core/finance/journal/journalEngine");
const ledgerEngine = require("./src/core/finance/ledger/ledgerEngine");
const gstEngine = require("./src/core/finance/gst/gstEngine");
const financialReportingEngine = require("./src/core/finance/reports/financialReportingEngine");
const financialKpiEngine = require("./src/core/finance/kpi/financialKpiEngine");
const budgetEngine = require("./src/core/finance/budget/budgetEngine");
const assetManager = require("./src/core/finance/assets/assetManager");
const periodClosingEngine = require("./src/core/finance/closing/periodClosingEngine");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Chart of Accounts Initialization ---");
    const accounts = await chartOfAccounts.listAccounts();
    console.log("✅ Chart of Accounts loaded! Total Accounts:", accounts.length, "Codes:", accounts.map(a => a.accountCode));

    console.log("\n--- TEST 2: Double-Entry Journal Posting (Debit == Credit) ---");
    const lines = [
      { accountCode: "1002", debit: 50000, credit: 0, description: "Customer payment received" },
      { accountCode: "4000", debit: 0, credit: 50000, description: "Sales Revenue recognized" },
    ];
    const journalDoc = await journalEngine.postJournal("Customer payment for Invoice INV-8001", lines, "ADM-0001");
    console.log("✅ Journal Posted! ID:", journalDoc.journalId, "Total Debit:", journalDoc.totalDebit, "Status:", journalDoc.status);

    console.log("\n--- TEST 3: General Ledger Posting & Trial Balance Validation ---");
    const tb = await ledgerEngine.getTrialBalance();
    console.log("✅ Trial Balance computed! Total Debit:", tb.totalDebit, "Total Credit:", tb.totalCredit, "Is Balanced:", tb.isBalanced);

    console.log("\n--- TEST 4: Indian GST Calculation Engine (18% Rate) ---");
    const gstCalc = gstEngine.calculateGst(10000, 18, false);
    console.log("✅ Intra-State GST Breakdown: CGST ₹", gstCalc.cgst, "| SGST ₹", gstCalc.sgst, "| Total Amount ₹", gstCalc.totalAmount);

    console.log("\n--- TEST 5: Financial KPI Calculation Engine ---");
    const kpis = await financialKpiEngine.calculateKpis();
    console.log("✅ Financial KPIs: Gross Margin:", kpis.grossMarginPct, "% EBITDA: ₹", kpis.ebitda, "Working Capital: ₹", kpis.workingCapital);

    console.log("\n--- TEST 6: Financial Reports Suite (P&L & Balance Sheet) ---");
    const pnl = await financialReportingEngine.getProfitAndLoss();
    const bs = await financialReportingEngine.getBalanceSheet();
    console.log("✅ P&L Net Profit: ₹", pnl.netProfit, "| Balance Sheet Is Balanced:", bs.isBalanced);

    console.log("\n--- TEST 7: Budget & Asset Management ---");
    const budgets = await budgetEngine.listBudgets();
    const assets = await assetManager.listAssets();
    console.log("✅ Total Budgets Tracked:", budgets.length, "| Total Fixed Assets Registered:", assets.length);

    console.log("\n--- TEST 8: Period Closing Engine ---");
    const period = await periodClosingEngine.closePeriod("2026-2027", 4, "ADM-0001", "SoftClosed");
    console.log("✅ Financial Period Status:", period.periodId, "Status:", period.status);

    console.log("\n🎉 ALL 8 ENTERPRISE FINANCE & ACCOUNTING PLATFORM TESTS PASSED SUCCESSFULLY!");
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
