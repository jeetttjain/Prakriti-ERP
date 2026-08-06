const Employee = require("../models/Employee");
const ExpenseClaim = require("../models/ExpenseClaim");
const HRTicket = require("../models/HRTicket");
const VisitorPass = require("../models/VisitorPass");
const employeeManager = require("../core/hrms/employees/employeeManager");
const orgStructureEngine = require("../core/hrms/organization/orgStructureEngine");
const attendanceEngine = require("../core/hrms/attendance/attendanceEngine");
const leaveEngine = require("../core/hrms/leave/leaveEngine");
const payrollEngine = require("../core/hrms/payroll/payrollEngine");
const hrmsAnalytics = require("../core/hrms/analytics/hrmsAnalytics");
const { successResponse, errorResponse } = require("../services/response.service");

// GET /api/hrms/employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await employeeManager.listEmployees();
    return successResponse(res, employees, "Employee directory retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/hrms/organization/chart
exports.getOrgChart = async (req, res) => {
  try {
    const org = await orgStructureEngine.getOrgStructure();
    return successResponse(res, org, "Organization chart hierarchy retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/hrms/attendance
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await attendanceEngine.listAttendance();
    return successResponse(res, attendance, "Attendance logs retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/hrms/leave
exports.getLeave = async (req, res) => {
  try {
    const leaves = await leaveEngine.listLeaveRequests();
    return successResponse(res, leaves, "Leave requests retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/hrms/payroll
exports.getPayroll = async (req, res) => {
  try {
    const payrollRuns = await payrollEngine.listPayrollRuns();
    return successResponse(res, payrollRuns, "Payroll runs retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/hrms/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await hrmsAnalytics.getHRMetrics();
    return successResponse(res, analytics, "HR analytics metrics generated.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/hrms/employee
exports.createEmployee = async (req, res) => {
  try {
    const emp = await employeeManager.createEmployee(req.body);
    return successResponse(res, emp, "New employee onboarded successfully.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/hrms/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employeeCode, method, status } = req.body;
    const att = await attendanceEngine.markAttendance(employeeCode, method, status);
    return successResponse(res, att, "Attendance marked successfully.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/hrms/leave
exports.applyLeave = async (req, res) => {
  try {
    const { employeeCode, type, startDate, endDate, reason } = req.body;
    const leave = await leaveEngine.applyLeave(employeeCode, type, startDate, endDate, reason);
    return successResponse(res, leave, "Leave request submitted.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/hrms/payroll/run
exports.runPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const run = await payrollEngine.runMonthlyPayroll(month, year, req.user?.userCode || "HR-ADMIN");
    return successResponse(res, run, "Monthly payroll run processed.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/hrms/expense
exports.submitExpense = async (req, res) => {
  try {
    const claim = await ExpenseClaim.create({ claimId: `EXP-${Date.now()}`, ...req.body });
    return successResponse(res, claim, "Expense claim submitted.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/hrms/helpdesk/ticket
exports.createTicket = async (req, res) => {
  try {
    const ticket = await HRTicket.create({ ticketId: `TCK-${Date.now()}`, ...req.body });
    return successResponse(res, ticket, "HR Helpdesk ticket raised.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/hrms/visitor/pass
exports.createVisitorPass = async (req, res) => {
  try {
    const pass = await VisitorPass.create({ passId: `VPASS-${Date.now()}`, ...req.body });
    return successResponse(res, pass, "Visitor gate pass generated.", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
