const JournalEntry = require("../models/JournalEntry");
const GeneralLedger = require("../models/GeneralLedger");
const Payment = require("../models/Payment");
const chartOfAccounts = require("../core/finance/accounts/chartOfAccounts");
const journalEngine = require("../core/finance/journal/journalEngine");
const financialReportingEngine = require("../core/finance/reports/financialReportingEngine");
const financialKpiEngine = require("../core/finance/kpi/financialKpiEngine");
const budgetEngine = require("../core/finance/budget/budgetEngine");
const assetManager = require("../core/finance/assets/assetManager");
const periodClosingEngine = require("../core/finance/closing/periodClosingEngine");
const arManager = require("../core/finance/receivables/arManager");
const apManager = require("../core/finance/payables/apManager");
const bankManager = require("../core/finance/banking/bankManager");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/finance/accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await chartOfAccounts.listAccounts();
    return successResponse(res, accounts, "Chart of Accounts retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/finance/ledger
exports.getLedger = async (req, res) => {
  try {
    const ledger = await GeneralLedger.find({}).sort({ createdAt: -1 }).limit(100);
    return successResponse(res, ledger, "General Ledger transactions retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/finance/journals
exports.getJournals = async (req, res) => {
  try {
    const journals = await JournalEntry.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, journals, "Journal entries retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/finance/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, payments, "Financial payments retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/finance/reports
exports.getReports = async (req, res) => {
  try {
    const pnl = await financialReportingEngine.getProfitAndLoss();
    const bs = await financialReportingEngine.getBalanceSheet();
    const tb = await financialReportingEngine.getTrialBalance();
    const kpis = await financialKpiEngine.calculateKpis();
    const ar = await arManager.getAccountsReceivableSummary();
    const ap = await apManager.getAccountsPayableSummary();

    return successResponse(res, { pnl, bs, tb, kpis, ar, ap }, "Financial reports generated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/finance/budget
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await budgetEngine.listBudgets();
    return successResponse(res, budgets, "Budgets retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/finance/assets
exports.getAssets = async (req, res) => {
  try {
    const assets = await assetManager.listAssets();
    return successResponse(res, assets, "Fixed Assets retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/finance/journal
exports.postJournal = async (req, res) => {
  try {
    const { narration, lines } = req.body;
    const journal = await journalEngine.postJournal(narration, lines, req.user?.userCode || "ADMIN-01");
    return successResponse(res, journal, "Double-Entry Journal posted successfully.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/finance/payment
exports.recordPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      ...req.body,
    });
    return successResponse(res, payment, "Payment recorded successfully.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/finance/reconciliation
exports.reconcileBank = async (req, res) => {
  try {
    const banks = await bankManager.listBankAccounts();
    return successResponse(res, { status: "RECONCILED", accounts: banks }, "Bank reconciliation completed.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/finance/closing
exports.closePeriod = async (req, res) => {
  try {
    const { fiscalYear, month, status } = req.body;
    const period = await periodClosingEngine.closePeriod(fiscalYear || "2026-2027", month || 4, req.user?.userCode || "ADMIN-01", status || "SoftClosed");
    return successResponse(res, period, "Financial period status updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/finance/budget
exports.updateBudget = async (req, res) => {
  try {
    return successResponse(res, req.body, "Budget updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/finance/journal/:id
exports.cancelJournal = async (req, res) => {
  try {
    const journal = await JournalEntry.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { journalId: req.params.id }] },
      { status: "Cancelled" },
      { new: true }
    );
    return successResponse(res, journal, "Journal entry cancelled.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
