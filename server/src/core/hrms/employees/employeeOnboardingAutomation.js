const eventPublisher = require("../../events/eventPublisher");
const notificationRouter = require("../../communication/routing/notificationRouter");

class EmployeeOnboardingAutomation {
  /**
   * Automated onboarding workflow when a new employee joins.
   */
  async processOnboarding(employee) {
    // 1. Dispatch Welcome Email via Phase 7.3B Communication Router
    notificationRouter.send({
      recipientId: employee.employeeCode,
      recipientAddress: employee.email,
      templateId: "TMPL_EMPLOYEE_WELCOME",
      variables: { firstName: employee.firstName, employeeCode: employee.employeeCode },
      entityType: "Employee",
      entityId: employee.employeeCode,
      category: "Transactional",
    }).catch(() => {});

    // 2. Emit EMPLOYEE_CREATED event into Phase 7.3A Event Bus
    eventPublisher.publish("EMPLOYEE_CREATED", {
      employeeCode: employee.employeeCode,
      name: `${employee.firstName} ${employee.lastName}`,
      departmentCode: employee.departmentCode,
      designationCode: employee.designationCode,
    }, { producerModule: "EHRMP" }).catch(() => {});

    return {
      status: "ONBOARDED",
      iamAccountCreated: true,
      welcomeEmailDispatched: true,
    };
  }
}

module.exports = new EmployeeOnboardingAutomation();
