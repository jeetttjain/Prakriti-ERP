const notificationService = require("../services/notification.service");
const templateService = require("../services/notificationTemplate.service");
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const { successResponse, errorResponse } = require("../services/response.service");

// LIST NOTIFICATIONS QUEUE
exports.getNotifications = async (req, res) => {
  try {
    const { status, channel, module: moduleName, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (channel) filter.channel = channel;
    if (moduleName) filter.module = moduleName;
    if (search) {
      filter.$or = [
        { recipient: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
        { notificationId: { $regex: search, $options: "i" } },
      ];
    }

    const list = await Notification.find(filter).sort({ createdAt: -1 });
    return successResponse(res, list);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// LIST NOTIFICATION TEMPLATES
exports.getTemplates = async (req, res) => {
  try {
    const templates = templateService.getSystemTemplates();
    return successResponse(res, templates);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// QUEUE NOTIFICATION
exports.createNotification = async (req, res) => {
  try {
    const { isScheduled, scheduledFor } = req.body;
    let ntf;
    if (isScheduled && scheduledFor) {
      ntf = await notificationService.scheduleNotification(req.body, scheduledFor);
    } else {
      ntf = await notificationService.queueNotification(req.body);
    }
    return successResponse(res, ntf, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DISPATCH NOTIFICATION
exports.sendNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const ntf = await notificationService.sendNotification(id);
    return successResponse(res, ntf);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// RETRY NOTIFICATION
exports.retryNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const ntf = await notificationService.retryNotification(id);
    return successResponse(res, ntf);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// CANCEL NOTIFICATION
exports.cancelNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const ntf = await notificationService.cancelNotification(id);
    return successResponse(res, ntf);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET PREFERENCES
exports.getPreferences = async (req, res) => {
  try {
    const { userId, customerId, supplierId } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    else if (customerId) query.customerId = customerId;
    else if (supplierId) query.supplierId = supplierId;
    else return errorResponse(res, "Missing recipient identification query parameter.", 400);

    let prefs = await NotificationPreference.findOne(query);
    if (!prefs) {
      // Return defaults
      prefs = {
        enabledChannels: { WhatsApp: true, SMS: true, Email: true, Push: true, InApp: true },
        language: "English",
      };
    }
    return successResponse(res, prefs);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// UPDATE PREFERENCES
exports.updatePreferences = async (req, res) => {
  try {
    const { userId, customerId, supplierId, enabledChannels, quietHours, language } = req.body;
    const query = {};
    if (userId) query.userId = userId;
    else if (customerId) query.customerId = customerId;
    else if (supplierId) query.supplierId = supplierId;
    else return errorResponse(res, "Missing recipient identification parameter.", 400);

    const prefs = await NotificationPreference.findOneAndUpdate(
      query,
      { enabledChannels, quietHours, language },
      { upsert: true, new: true }
    );
    return successResponse(res, prefs);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
