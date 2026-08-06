const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/crm.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/customers", ctrl.getCustomers);
router.get("/customer360/:customerCode", ctrl.getCustomer360);
router.get("/leads", ctrl.getLeads);
router.get("/opportunities", ctrl.getOpportunities);
router.get("/quotations", ctrl.getQuotations);
router.get("/activities", ctrl.getActivities);
router.get("/followups", ctrl.getFollowups);
router.get("/tasks", ctrl.getTasks);
router.get("/visits", ctrl.getVisits);
router.get("/complaints", ctrl.getComplaints);
router.get("/credit", ctrl.getCredit);
router.get("/collections", ctrl.getCollections);
router.get("/forecast", ctrl.getForecast);
router.get("/health/:customerCode", ctrl.getHealth);
router.get("/analytics", ctrl.getAnalytics);
router.get("/contracts", ctrl.getContracts);
router.get("/commissions", ctrl.getCommissions);
router.get("/campaigns", ctrl.getCampaigns);
router.get("/surveys", ctrl.getSurveys);
router.get("/success/:customerCode", ctrl.getCustomerSuccess);
router.get("/recommendations/:customerCode", ctrl.getRecommendations);
router.get("/territory-performance", ctrl.getTerritoryPerformance);
router.get("/audit", ctrl.getAuditLogs);

router.post("/customer", ctrl.createCustomer);
router.post("/lead", ctrl.createLead);
router.post("/lead/convert", ctrl.convertLead);
router.post("/quotation", ctrl.createQuotation);
router.post("/visit", ctrl.logVisit);
router.post("/complaint", ctrl.logComplaint);
router.post("/collection", ctrl.recordCollection);
router.post("/contract", ctrl.createContract);
router.post("/campaign", ctrl.createCampaign);

module.exports = router;
