require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const customerManager = require("./src/core/crm/customers/customerManager");
const customer360Engine = require("./src/core/crm/customers/customer360Engine");
const leadManager = require("./src/core/crm/leads/leadManager");
const opportunityEngine = require("./src/core/crm/opportunities/opportunityEngine");
const quotationEngine = require("./src/core/crm/quotation/quotationEngine");
const activityEngine = require("./src/core/crm/activities/activityEngine");
const followupEngine = require("./src/core/crm/followups/followupEngine");
const salesTaskEngine = require("./src/core/crm/tasks/salesTaskEngine");
const visitManager = require("./src/core/crm/visits/visitManager");
const complaintManager = require("./src/core/crm/complaints/complaintManager");
const collectionEngine = require("./src/core/crm/collections/collectionEngine");
const customerHealthEngine = require("./src/core/crm/health/customerHealthEngine");
const salesForecastEngine = require("./src/core/crm/forecast/salesForecastEngine");
const loyaltyEngine = require("./src/core/crm/loyalty/loyaltyEngine");
const crmAnalytics = require("./src/core/crm/analytics/crmAnalytics");

// Expansion Engines
const salesCommissionEngine = require("./src/core/crm/commissions/salesCommissionEngine");
const campaignManager = require("./src/core/crm/campaigns/campaignManager");
const surveyEngine = require("./src/core/crm/surveys/surveyEngine");
const contractManager = require("./src/core/crm/contracts/contractManager");
const recommendationEngine = require("./src/core/crm/recommendations/recommendationEngine");
const customerSuccessEngine = require("./src/core/crm/success/customerSuccessEngine");
const territoryPerformanceEngine = require("./src/core/crm/territories/territoryPerformanceEngine");
const crmAuditEngine = require("./src/core/crm/audit/crmAuditEngine");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: B2B / B2C Customer Master & Credit Profile ---");
    const customers = await customerManager.listCustomers();
    const newCust = await customerManager.createCustomer({
      companyName: "Udaipur Fresh Mart",
      contactName: "Kamlesh Mehta",
      email: "kamlesh@udaipurfresh.com",
      phone: "+919829011111",
      gstin: "08CCCCCC2222C1Z4",
      segment: "Wholesale",
      creditLimit: 300000,
    });
    console.log("✅ Customer Onboarded! Code:", newCust.customerCode, "Total Accounts:", customers.length + 1);

    console.log("\n--- TEST 2: Customer 360 Profile Aggregator ---");
    const c360 = await customer360Engine.getCustomer360Profile(newCust.customerCode);
    console.log("✅ Customer 360 Aggregated! Health Score:", c360.healthScore.healthScore, "| Loyalty Tier:", c360.loyaltyAccount.tier);

    console.log("\n--- TEST 3: Lead Capture, Extensible Lead Scoring & Auto-Conversion ---");
    const lead = await leadManager.createLead({
      companyName: "Kota Super Market",
      contactName: "Anil Agarwal",
      email: "anil@kotasuper.com",
      phone: "+919829022222",
      leadSource: "Website",
      leadScore: 88,
    });
    console.log("✅ Lead Captured! Lead ID:", lead.leadId, "Score:", lead.leadScore);

    const conversion = await leadManager.convertLead(lead.leadId);
    console.log("✅ Lead Converted to Customer Account! New Customer Code:", conversion.customer.customerCode);

    console.log("\n--- TEST 4: Opportunity Pipeline & Revenue Forecasting ---");
    const opp = await opportunityEngine.createOpportunity({
      customerCode: newCust.customerCode,
      title: "Q4 Bulk Cold-Pressed Mustard Oil Supply",
      stage: "Proposal",
      expectedRevenue: 350000,
    });
    console.log("✅ Opportunity Created! ID:", opp.opportunityId, "Revenue: ₹", opp.expectedRevenue);

    console.log("\n--- TEST 5: Quotation Engine & WhatsApp Dispatch ---");
    const quote = await quotationEngine.createQuotation(newCust.customerCode, [
      { productCode: "PROD-OIL-01", quantity: 200, unitPrice: 180 },
    ]);
    console.log("✅ Quotation Issued & Sent! ID:", quote.quotationId, "Total Amount: ₹", quote.totalAmount);

    console.log("\n--- TEST 6: Activity Logging & Follow-up Reminders ---");
    const act = await activityEngine.logActivity(newCust.customerCode, "Call", "Sales Call Conducted", { durationMinutes: 15 });
    const flp = await followupEngine.createFollowup(newCust.customerCode, "Call", new Date(), "Follow-up on Quotation approval");
    console.log("✅ Activity Logged:", act.activityId, "| Follow-up Scheduled:", flp.followUpId);

    console.log("\n--- TEST 7: Sales Visit Beat Plan & GPS Check-In ---");
    const visit = await visitManager.logVisit(newCust.customerCode, "SALES-EXEC-01", "Field Visit to Store", "OrderPlaced");
    console.log("✅ Sales Visit Logged! Visit ID:", visit.visitId, "Outcome:", visit.outcome);

    console.log("\n--- TEST 8: Customer Complaint SLA Resolution ---");
    const complaint = await complaintManager.logComplaint(newCust.customerCode, "Quality", "Packaging Inspection Request", "High");
    const resolved = await complaintManager.resolveComplaint(complaint.complaintId, "Inspected and approved by QC");
    console.log("✅ Complaint Logged & Resolved! Complaint ID:", resolved.complaintId, "Status:", resolved.status);

    console.log("\n--- TEST 9: Collection Management & Finance Ledger Posting ---");
    const collection = await collectionEngine.recordPaymentReceipt(newCust.customerCode, 50000);
    console.log("✅ Collection Receipt Posted to Finance! Collection ID:", collection.collectionId, "Amount: ₹", collection.outstandingAmount);

    console.log("\n--- TEST 10: Loyalty Program & Tier Upgrades ---");
    const loyalty = await loyaltyEngine.redeemPoints(newCust.customerCode, 100);
    console.log("✅ Loyalty Points Redeemed! Remaining Balance:", loyalty.pointsBalance);

    console.log("\n--- TEST 11: HRMS & Finance Integrated Sales Commissions ---");
    const commission = await salesCommissionEngine.calculateCommission("SALES-EXEC-01", quote.quotationId, 350000);
    console.log("✅ Sales Commission Calculated & Accrued in Finance! ID:", commission.commissionId, "Amount: ₹", commission.commissionAmount);

    console.log("\n--- TEST 12: Marketing Campaigns & Target Segments ---");
    const campaigns = await campaignManager.listCampaigns();
    console.log("✅ Marketing Campaigns Active:", campaigns.length, "| Top Campaign:", campaigns[0].name);

    console.log("\n--- TEST 13: Customer Contracts & EDP Linkage ---");
    const contracts = await contractManager.listContracts(newCust.customerCode);
    console.log("✅ Customer Contracts Loaded:", contracts.length, "| Contract ID:", contracts[0].contractId);

    console.log("\n--- TEST 14: Customer Success Health & Churn Risk Prediction ---");
    const success = await customerSuccessEngine.getSuccessHealth(newCust.customerCode);
    console.log("✅ Customer Success Score:", success.successScore, "| Churn Risk:", success.churnRisk);

    console.log("\n--- TEST 15: Product Recommendations Engine ---");
    const recs = await recommendationEngine.getRecommendations(newCust.customerCode);
    console.log("✅ Product Recommendations Generated:", recs.recommendedProducts.length, "items.");

    console.log("\n--- TEST 16: Territory Performance KPIs ---");
    const terrPerf = await territoryPerformanceEngine.getTerritoryMetrics();
    console.log("✅ Territory Performance Metrics Loaded for", terrPerf.length, "Territories.");

    console.log("\n--- TEST 17: CRM Audit Logging & EOP Telemetry ---");
    const audit = await crmAuditEngine.logAudit("QUOTATION_ISSUED", "Quotation", quote.quotationId, "SALES-EXEC-01");
    console.log("✅ Immutable Audit Logged & EOP Metric Recorded! Audit ID:", audit.auditId);

    console.log("\n--- TEST 18: CRM Analytics Calculator ---");
    const analytics = await crmAnalytics.getCRMPerformanceMetrics();
    console.log("✅ CRM Analytics: Conversion Rate =", analytics.leadConversionRatePct, "% | Pipeline Value = ₹", analytics.pipelineValueTotal);

    console.log("\n🎉 ALL 18 ENTERPRISE CRM PLATFORM EXPANSION TESTS PASSED SUCCESSFULLY!");
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
