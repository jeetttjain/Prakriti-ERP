const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/hrms.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/employees", ctrl.getEmployees);
router.get("/organization/chart", ctrl.getOrgChart);
router.get("/attendance", ctrl.getAttendance);
router.get("/leave", ctrl.getLeave);
router.get("/payroll", ctrl.getPayroll);
router.get("/analytics", ctrl.getAnalytics);

router.post("/employee", ctrl.createEmployee);
router.post("/attendance", ctrl.markAttendance);
router.post("/leave", ctrl.applyLeave);
router.post("/payroll/run", ctrl.runPayroll);
router.post("/expense", ctrl.submitExpense);
router.post("/helpdesk/ticket", ctrl.createTicket);
router.post("/visitor/pass", ctrl.createVisitorPass);

module.exports = router;
