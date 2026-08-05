const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/finance.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/accounts", ctrl.getAccounts);
router.get("/ledger", ctrl.getLedger);
router.get("/journals", ctrl.getJournals);
router.get("/payments", ctrl.getPayments);
router.get("/reports", ctrl.getReports);
router.get("/budget", ctrl.getBudgets);
router.get("/assets", ctrl.getAssets);

router.post("/journal", ctrl.postJournal);
router.post("/payment", ctrl.recordPayment);
router.post("/reconciliation", ctrl.reconcileBank);
router.post("/closing", ctrl.closePeriod);

router.patch("/budget", ctrl.updateBudget);
router.delete("/journal/:id", ctrl.cancelJournal);

module.exports = router;
