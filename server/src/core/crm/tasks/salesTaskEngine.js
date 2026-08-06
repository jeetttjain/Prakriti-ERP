const SalesTask = require("../../../models/SalesTask");

class SalesTaskEngine {
  async getTasksForExecutive(executiveCode = "SALES-EXEC-01") {
    const count = await SalesTask.countDocuments({ executiveCode });
    if (count === 0) {
      await SalesTask.create([
        { taskId: "TSK-101", executiveCode, title: "Customer Visit: Jaipur Agro Mart", type: "Visit", status: "Pending" },
        { taskId: "TSK-102", executiveCode, title: "Quotation Follow-up: QT-901", type: "Quotation", status: "Pending" },
      ]);
    }
    return SalesTask.find({ executiveCode }).sort({ dueDate: 1 });
  }
}

module.exports = new SalesTaskEngine();
