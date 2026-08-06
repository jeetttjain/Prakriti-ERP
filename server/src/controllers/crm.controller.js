const Customer = require("../models/Customer");
const CreditProfile = require("../models/CreditProfile");
const PriceList = require("../models/PriceList");
const Territory = require("../models/Territory");
const customerManager = require("../core/crm/customers/customerManager");
const customer360Engine = require("../core/crm/customers/customer360Engine");
const leadManager = require("../core/crm/leads/leadManager");
const leadAssignmentEngine = require("../core/crm/leads/leadAssignmentEngine");
const opportunityEngine = require("../core/crm/opportunities/opportunityEngine");
const quotationEngine = require("../core/crm/quotation/quotationEngine");
const activityEngine = require("../core/crm/activities/activityEngine");
const followupEngine = require("../core/crm/followups/followupEngine");
const salesTaskEngine = require("../core/crm/tasks/salesTaskEngine");
const visitManager = require("../core/crm/visits/visitManager");
const complaintManager = require("../core/crm/complaints/complaintManager");
const collectionEngine = require("../core/crm/collections/collectionEngine");
const customerHealthEngine = require("../core/crm/health/customerHealthEngine");
const salesForecastEngine = require("../core/crm/forecast/salesForecastEngine");
const loyaltyEngine = require("../core/crm/loyalty/loyaltyEngine");
const crmAnalytics = require("../core/crm/analytics/crmAnalytics");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/crm/customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await customerManager.listCustomers();
    return successResponse(res, customers, "Customer directory retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/customer360/:customerCode
exports.getCustomer360 = async (req, res) => {
  try {
    const profile = await customer360Engine.getCustomer360Profile(req.params.customerCode);
    return successResponse(res, profile, "Customer 360 profile aggregated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await leadManager.listLeads();
    return successResponse(res, leads, "Leads retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/opportunities
exports.getOpportunities = async (req, res) => {
  try {
    const opps = await opportunityEngine.listOpportunities();
    return successResponse(res, opps, "Sales opportunities retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/quotations
exports.getQuotations = async (req, res) => {
  try {
    const quotes = await quotationEngine.listQuotations();
    return successResponse(res, quotes, "Quotations retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await activityEngine.getActivitiesForCustomer(req.query.customerCode || "CUST-B2B-01");
    return successResponse(res, activities, "Activities retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/followups
exports.getFollowups = async (req, res) => {
  try {
    const followups = await followupEngine.listFollowups();
    return successResponse(res, followups, "Follow-ups retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await salesTaskEngine.getTasksForExecutive(req.query.executiveCode || "SALES-EXEC-01");
    return successResponse(res, tasks, "Sales tasks retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/visits
exports.getVisits = async (req, res) => {
  try {
    const visits = await visitManager.listVisits();
    return successResponse(res, visits, "Sales visits retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await complaintManager.listComplaints();
    return successResponse(res, complaints, "Complaints retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/credit
exports.getCredit = async (req, res) => {
  try {
    const profiles = await CreditProfile.find({});
    return successResponse(res, profiles, "Credit profiles retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/collections
exports.getCollections = async (req, res) => {
  try {
    const cols = await collectionEngine.listCollections();
    return successResponse(res, cols, "Collections retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/forecast
exports.getForecast = async (req, res) => {
  try {
    const fcst = await salesForecastEngine.getForecast();
    return successResponse(res, fcst, "Sales forecast generated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/health/:customerCode
exports.getHealth = async (req, res) => {
  try {
    const health = await customerHealthEngine.getHealthScore(req.params.customerCode);
    return successResponse(res, health, "Customer health score retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/crm/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await crmAnalytics.getCRMPerformanceMetrics();
    return successResponse(res, analytics, "CRM analytics generated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/crm/customer
exports.createCustomer = async (req, res) => {
  try {
    const cust = await customerManager.createCustomer(req.body);
    return successResponse(res, cust, "Customer account created.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/crm/lead
exports.createLead = async (req, res) => {
  try {
    const lead = await leadManager.createLead(req.body);
    return successResponse(res, lead, "New lead captured.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/crm/lead/convert
exports.convertLead = async (req, res) => {
  try {
    const result = await leadManager.convertLead(req.body.leadId);
    return successResponse(res, result, "Lead converted to customer account.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/crm/quotation
exports.createQuotation = async (req, res) => {
  try {
    const { customerCode, items, discountPct } = req.body;
    const quotation = await quotationEngine.createQuotation(customerCode, items, discountPct);
    return successResponse(res, quotation, "Quotation issued & sent via Communication Engine.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/crm/visit
exports.logVisit = async (req, res) => {
  try {
    const { customerCode, executiveCode, notes, outcome } = req.body;
    const visit = await visitManager.logVisit(customerCode, executiveCode, notes, outcome);
    return successResponse(res, visit, "Sales visit logged.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/crm/complaint
exports.logComplaint = async (req, res) => {
  try {
    const { customerCode, category, subject, priority } = req.body;
    const complaint = await complaintManager.logComplaint(customerCode, category, subject, priority);
    return successResponse(res, complaint, "Customer complaint logged.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/crm/collection
exports.recordCollection = async (req, res) => {
  try {
    const { customerCode, amount } = req.body;
    const col = await collectionEngine.recordPaymentReceipt(customerCode, amount, req.user?.userCode || "COLLECTION-EXEC");
    return successResponse(res, col, "Payment receipt recorded & posted to Finance.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
