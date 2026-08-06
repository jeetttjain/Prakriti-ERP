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

router.post("/customer", ctrl.createCustomer);
router.post("/lead", ctrl.createLead);
router.post("/lead/convert", ctrl.convertLead);
router.post("/quotation", ctrl.createQuotation);
router.post("/visit", ctrl.logVisit);
router.post("/complaint", ctrl.logComplaint);
router.post("/collection", ctrl.recordCollection);

module.exports = router;
