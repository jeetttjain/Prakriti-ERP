const Department = require("../../../models/Department");
const Designation = require("../../../models/Designation");

class OrgStructureEngine {
  async initializeDefaults() {
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.create([
        { departmentCode: "DEPT-ENG", name: "Engineering & IT", headUserCode: "EMP-001", budgetAnnual: 12000000 },
        { departmentCode: "DEPT-HR", name: "Human Resources", headUserCode: "EMP-002", budgetAnnual: 5000000 },
        { departmentCode: "DEPT-FIN", name: "Finance & Accounting", headUserCode: "EMP-003", budgetAnnual: 6000000 },
        { departmentCode: "DEPT-SCM", name: "Supply Chain & Operations", headUserCode: "EMP-004", budgetAnnual: 8000000 },
      ]);
    }

    const desigCount = await Designation.countDocuments();
    if (desigCount === 0) {
      await Designation.create([
        { designationCode: "DESIG-VP", title: "Vice President", level: 5 },
        { designationCode: "DESIG-MGR", title: "Department Manager", level: 4 },
        { designationCode: "DESIG-SR", title: "Senior Lead Specialist", level: 3 },
        { designationCode: "DESIG-EXEC", title: "Associate Executive", level: 2 },
      ]);
    }
  }

  async getOrgStructure() {
    await this.initializeDefaults();
    const depts = await Department.find({});
    const desigs = await Designation.find({});
    return { depts, desigs };
  }
}

module.exports = new OrgStructureEngine();
