const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const whatsappProvider = require("../providers/whatsapp.provider");
const emailProvider = require("../providers/email.provider");
const smsProvider = require("../providers/sms.provider");
const pushProvider = require("../providers/push.provider");

/**
 * Creates and logs initial notification payload in DB.
 */
const createNotification = async (data) => {
  const notificationId = `NTF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Preferences checks (use defaults if none exist)
  let channelEnabled = true;
  if (data.customerId || data.userId || data.supplierId) {
    const query = {};
    if (data.customerId) query.customerId = data.customerId;
    else if (data.userId) query.userId = data.userId;
    else if (data.supplierId) query.supplierId = data.supplierId;

    const prefs = await NotificationPreference.findOne(query);
    if (prefs && prefs.enabledChannels) {
      const channelKey = data.channel === "In App" ? "InApp" : data.channel;
      if (prefs.enabledChannels[channelKey] === false) {
        channelEnabled = false;
      }
    }
  }

  const initialStatus = channelEnabled ? "Queued" : "Cancelled";
  const remarks = channelEnabled ? "Message initialized and queued." : "Cancelled due to channel preference toggles.";

  const notification = await Notification.create({
    notificationId,
    type: data.type,
    module: data.module,
    referenceId: data.referenceId,
    referenceNumber: data.referenceNumber,
    recipient: data.recipient,
    channel: data.channel,
    status: initialStatus,
    priority: data.priority || "Normal",
    message: data.message,
    template: data.template,
    notificationTimeline: [
      {
        status: initialStatus,
        remarks,
      },
    ],
  });

  return notification;
};

const queueNotification = async (data) => {
  return await createNotification(data);
};

/**
 * Executes mock provider triggers and appends status records to the timeline.
 */
const sendNotification = async (id) => {
  const ntf = await Notification.findById(id);
  if (!ntf) throw new Error("Notification not found.");
  if (ntf.status === "Cancelled") return ntf;

  ntf.status = "Processing";
  ntf.notificationTimeline.push({ status: "Processing", remarks: "Delegating payload to service provider." });
  await ntf.save();

  try {
    let result;
    switch (ntf.channel) {
      case "WhatsApp":
        result = await whatsappProvider.sendWhatsApp(ntf.recipient, ntf.message);
        break;
      case "Email":
        result = await emailProvider.sendEmail(ntf.recipient, ntf.message);
        break;
      case "SMS":
        result = await smsProvider.sendSMS(ntf.recipient, ntf.message);
        break;
      case "Push":
        result = await pushProvider.sendPush(ntf.recipient, ntf.message);
        break;
      case "In App":
        result = { success: true, messageId: "in_app_log" };
        break;
      default:
        throw new Error(`Unsupported transmission channel ${ntf.channel}`);
    }

    if (result.success) {
      ntf.status = "Sent";
      ntf.sentAt = new Date();
      ntf.notificationTimeline.push({
        status: "Sent",
        provider: ntf.channel,
        remarks: `Dispatched successfully. Message ID: ${result.messageId}`,
      });
      await ntf.save();

      // Mock auto-delivery step
      setTimeout(async () => {
        await markDelivered(id);
      }, 500);
    } else {
      throw new Error("Provider dispatch request failed.");
    }
  } catch (error) {
    ntf.status = "Failed";
    ntf.errorMessage = error.message;
    ntf.retryCount += 1;
    ntf.notificationTimeline.push({
      status: "Failed",
      remarks: `Dispatch failed: ${error.message}`,
    });
    await ntf.save();
  }

  return ntf;
};

const retryNotification = async (id) => {
  const ntf = await Notification.findById(id);
  if (!ntf) throw new Error("Notification not found.");

  ntf.status = "Queued";
  ntf.notificationTimeline.push({
    status: "Queued",
    remarks: `Manual retry request initiated. Total retries: ${ntf.retryCount}`,
  });
  await ntf.save();

  // Trigger dispatch
  return await sendNotification(id);
};

const cancelNotification = async (id) => {
  const ntf = await Notification.findById(id);
  if (!ntf) throw new Error("Notification not found.");

  ntf.status = "Cancelled";
  ntf.notificationTimeline.push({ status: "Cancelled", remarks: "Dispatch request cancelled by administrator." });
  await ntf.save();
  return ntf;
};

const markDelivered = async (id) => {
  const ntf = await Notification.findById(id);
  if (!ntf) return;

  ntf.status = "Delivered";
  ntf.deliveredAt = new Date();
  ntf.notificationTimeline.push({ status: "Delivered", remarks: "Recipient handset acknowledged delivery confirmation." });
  await ntf.save();
};

const markRead = async (id) => {
  const ntf = await Notification.findById(id);
  if (!ntf) return;

  ntf.status = "Read";
  ntf.readAt = new Date();
  ntf.notificationTimeline.push({ status: "Read", remarks: "Recipient read/opened notification log." });
  await ntf.save();
};

/**
 * Stores scheduling parameters. Actual trigger handled by cron/automation systems later.
 */
const scheduleNotification = async (data, scheduledFor) => {
  const notificationId = `NTF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const notification = await Notification.create({
    notificationId,
    type: data.type,
    module: data.module,
    referenceId: data.referenceId,
    referenceNumber: data.referenceNumber,
    recipient: data.recipient,
    channel: data.channel,
    status: "Queued",
    priority: data.priority || "Normal",
    message: data.message,
    template: data.template,
    isScheduled: true,
    scheduledFor,
    scheduleStatus: "Pending",
    notificationTimeline: [
      {
        status: "Queued",
        remarks: `Scheduled for delivery at ${new Date(scheduledFor).toLocaleString()}`,
      },
    ],
  });

  return notification;
};

const cancelScheduledNotification = async (id) => {
  const ntf = await Notification.findById(id);
  if (!ntf) throw new Error("Notification not found.");

  if (ntf.isScheduled) {
    ntf.scheduleStatus = "Cancelled";
    ntf.status = "Cancelled";
    ntf.notificationTimeline.push({ status: "Cancelled", remarks: "Scheduled delivery cancelled." });
    await ntf.save();
  }
  return ntf;
};

module.exports = {
  createNotification,
  queueNotification,
  sendNotification,
  retryNotification,
  cancelNotification,
  markDelivered,
  markRead,
  scheduleNotification,
  cancelScheduledNotification,
};
