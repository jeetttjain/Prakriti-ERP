const mongoose = require("mongoose");
const Complaint = require("../../../models/Complaint");
const activityEngine = require("../activities/activityEngine");
const eventPublisher = require("../../events/eventPublisher");

class ComplaintManager {
  async initializeDefaults() {
    const count = await Complaint.countDocuments();
    if (count > 0) return;

    await Complaint.create([
      { complaintId: "CMP-801", customerCode: "CUST-B2B-01", category: "Packaging", subject: "Minor damage on outer master carton during transit", priority: "Medium", status: "Open" },
    ]);
  }

  async listComplaints() {
    await this.initializeDefaults();
    return Complaint.find({}).sort({ createdAt: -1 });
  }

  async logComplaint(customerCode, category, subject, priority = "Medium") {
    const complaintId = `CMP-${Date.now().toString().slice(-4)}`;
    const complaint = await Complaint.create({
      complaintId,
      customerCode,
      category,
      subject,
      priority,
      status: "Open",
    });

    await activityEngine.logActivity(customerCode, "Complaint", `Complaint Logged: ${subject}`, { category, priority });
    eventPublisher.publish("COMPLAINT_CREATED", { complaintId, customerCode, category, priority }, { producerModule: "ECXP" }).catch(() => {});

    return complaint;
  }

  async resolveComplaint(complaintId, resolutionNotes = "Resolved by Customer Support") {
    const query = mongoose.Types.ObjectId.isValid(complaintId) ? { $or: [{ _id: complaintId }, { complaintId }] } : { complaintId };
    const complaint = await Complaint.findOne(query);
    if (!complaint) throw new Error(`Complaint ${complaintId} not found.`);

    complaint.status = "Resolved";
    complaint.resolutionNotes = resolutionNotes;
    await complaint.save();

    await activityEngine.logActivity(complaint.customerCode, "Complaint", `Complaint ${complaint.complaintId} Resolved`, { resolutionNotes });
    eventPublisher.publish("COMPLAINT_RESOLVED", { complaintId: complaint.complaintId, customerCode: complaint.customerCode }, { producerModule: "ECXP" }).catch(() => {});

    return complaint;
  }
}

module.exports = new ComplaintManager();
