const Employee = require("../../../models/Employee");
const employeeOnboardingAutomation = require("./employeeOnboardingAutomation");

class EmployeeManager {
  async initializeDefaults() {
    const count = await Employee.countDocuments();
    if (count > 0) return;

    const initialStaff = [
      { employeeCode: "EMP-001", firstName: "Jeet", lastName: "Jain", email: "jeet@prakriti.org", phone: "+919829011111", departmentCode: "DEPT-ENG", designationCode: "DESIG-VP", status: "Active" },
      { employeeCode: "EMP-002", firstName: "Pooja", lastName: "Mehta", email: "pooja@prakriti.org", phone: "+919829022222", departmentCode: "DEPT-HR", designationCode: "DESIG-MGR", status: "Active" },
      { employeeCode: "EMP-003", firstName: "Amit", lastName: "Verma", email: "amit@prakriti.org", phone: "+919829033333", departmentCode: "DEPT-FIN", designationCode: "DESIG-SR", status: "Active" },
    ];

    await Employee.insertMany(initialStaff);
  }

  async listEmployees() {
    await this.initializeDefaults();
    return Employee.find({}).sort({ employeeCode: 1 });
  }

  async createEmployee(data) {
    const employeeCode = `EMP-${Date.now().toString().slice(-4)}`;
    const emp = await Employee.create({ employeeCode, ...data });

    // Execute automated onboarding workflow
    await employeeOnboardingAutomation.processOnboarding(emp).catch(() => {});

    return emp;
  }
}

module.exports = new EmployeeManager();
