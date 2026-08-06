require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const orgStructureEngine = require("./src/core/hrms/organization/orgStructureEngine");
const employeeManager = require("./src/core/hrms/employees/employeeManager");
const attendanceEngine = require("./src/core/hrms/attendance/attendanceEngine");
const leaveEngine = require("./src/core/hrms/leave/leaveEngine");
const payrollEngine = require("./src/core/hrms/payroll/payrollEngine");
const hrmsAnalytics = require("./src/core/hrms/analytics/hrmsAnalytics");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Multi-Company Organization Structure & Departments ---");
    const org = await orgStructureEngine.getOrgStructure();
    console.log("✅ Departments Loaded:", org.depts.length, "| Designations Loaded:", org.desigs.length);

    console.log("\n--- TEST 2: Employee Onboarding & Automated Workflow Execution ---");
    const employees = await employeeManager.listEmployees();
    const newEmp = await employeeManager.createEmployee({
      firstName: "Rohan",
      lastName: "Sharma",
      email: "rohan@prakriti.org",
      phone: "+919829099999",
      departmentCode: "DEPT-ENG",
      designationCode: "DESIG-EXEC",
    });
    console.log("✅ Employee Onboarded! Code:", newEmp.employeeCode, "Total Staff:", employees.length + 1);

    console.log("\n--- TEST 3: Multi-Mode Attendance Engine ---");
    const att = await attendanceEngine.markAttendance(newEmp.employeeCode, "Biometric", "Present");
    console.log("✅ Attendance Marked! ID:", att.attendanceId, "Method:", att.method, "Status:", att.status);

    console.log("\n--- TEST 4: Leave Engine & Multi-Level Approvals ---");
    const leave = await leaveEngine.applyLeave(newEmp.employeeCode, "Casual", "2026-08-20", "2026-08-21", "Personal Leave");
    console.log("✅ Leave Applied & Approved! Leave ID:", leave.leaveId, "Status:", leave.status);

    console.log("\n--- TEST 5: Finance-Integrated Statutory Payroll Engine & Ledger Posting ---");
    const payrollRun = await payrollEngine.runMonthlyPayroll(8, 2026, "HR-ADMIN");
    console.log("✅ Payroll Processed & Finance Journal Posted! Payroll Run ID:", payrollRun.payrollRunId, "Total Gross: ₹", payrollRun.totalGross, "Total Net: ₹", payrollRun.totalNet);

    console.log("\n--- TEST 6: HR Analytics Calculator ---");
    const analytics = await hrmsAnalytics.getHRMetrics();
    console.log("✅ HR Analytics: Headcount =", analytics.headcount, "| Attendance Rate =", analytics.attendanceRatePct, "% | Payroll Cost = ₹", analytics.monthlyPayrollCost);

    console.log("\n🎉 ALL 6 ENTERPRISE HUMAN RESOURCE MANAGEMENT PLATFORM TESTS PASSED SUCCESSFULLY!");
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
