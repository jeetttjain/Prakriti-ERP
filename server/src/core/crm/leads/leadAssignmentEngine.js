const LeadAssignment = require("../../../models/LeadAssignment");

class LeadAssignmentEngine {
  async assignLead(leadId, algorithm = "RoundRobin", assignedTo = "SALES-EXEC-01") {
    const assignmentId = `ASG-${Date.now()}`;
    return LeadAssignment.create({
      assignmentId,
      leadId,
      algorithm,
      assignedTo,
    });
  }
}

module.exports = new LeadAssignmentEngine();
