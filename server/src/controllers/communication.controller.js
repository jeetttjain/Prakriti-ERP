const CommunicationMessage = require("../models/CommunicationMessage");
const CommunicationConversation = require("../models/CommunicationConversation");
const CommunicationTemplate = require("../models/CommunicationTemplate");
const CommunicationProvider = require("../models/CommunicationProvider");
const CommunicationPreference = require("../models/CommunicationPreference");
const CommunicationCampaign = require("../models/CommunicationCampaign");
const notificationRouter = require("../core/communication/routing/notificationRouter");
const deliveryEngine = require("../core/communication/delivery/deliveryEngine");
const communicationAnalytics = require("../core/communication/analytics/communicationAnalytics");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");

// GET /api/communication/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await CommunicationMessage.find({}).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, messages, "Messages retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/communication/conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await CommunicationConversation.find({}).sort({ lastMessageAt: -1 }).limit(50);
    return successResponse(res, conversations, "Conversations retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/communication/templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await CommunicationTemplate.find({}).sort({ createdAt: -1 });
    return successResponse(res, templates, "Templates retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/communication/providers
exports.getProviders = async (req, res) => {
  try {
    const providers = await CommunicationProvider.find({}).sort({ priorityRank: 1 });
    return successResponse(res, providers, "Providers retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/communication/preferences
exports.getPreferences = async (req, res) => {
  try {
    const prefs = await CommunicationPreference.find({});
    return successResponse(res, prefs, "Preferences retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/communication/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await communicationAnalytics.getAnalytics();
    return successResponse(res, analytics, "Analytics loaded.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/communication/send
exports.sendMessage = async (req, res) => {
  try {
    const msgDoc = await notificationRouter.send(req.body);
    auditLogService.logEvent({
      module: "Communication",
      action: "Message Sent",
      performedBy: req.user?.userCode || "Admin",
      targetId: msgDoc.messageId,
      ipAddress: req.ip,
    }).catch(() => {});
    return successResponse(res, msgDoc, "Message sent via Communication Engine.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/communication/template
exports.createTemplate = async (req, res) => {
  try {
    const templateId = `TMPL-${Date.now()}`;
    const tmpl = await CommunicationTemplate.create({ ...req.body, templateId });
    return successResponse(res, tmpl, "Template created.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/communication/provider
exports.createProvider = async (req, res) => {
  try {
    const providerId = `PROV-${Date.now()}`;
    const prov = await CommunicationProvider.create({ ...req.body, providerId });
    return successResponse(res, prov, "Provider created.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/communication/campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaignId = `CMP-${Date.now()}`;
    const cmp = await CommunicationCampaign.create({ ...req.body, campaignId });
    return successResponse(res, cmp, "Campaign created.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/communication/retry/:id
exports.retryMessage = async (req, res) => {
  try {
    const result = await deliveryEngine.retryMessage(req.params.id);
    return successResponse(res, result.messageDoc, "Message retried.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/communication/cancel/:id
exports.cancelMessage = async (req, res) => {
  try {
    const msg = await CommunicationMessage.findOneAndUpdate({ messageId: req.params.id }, { status: "Cancelled" }, { new: true });
    return successResponse(res, msg, "Message cancelled.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/communication/approve/:id
exports.approveTemplate = async (req, res) => {
  try {
    const tmpl = await CommunicationTemplate.findOneAndUpdate({ templateId: req.params.id }, { status: "Approved" }, { new: true });
    return successResponse(res, tmpl, "Template approved.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/communication/template/:id
exports.updateTemplate = async (req, res) => {
  try {
    const tmpl = await CommunicationTemplate.findOneAndUpdate({ templateId: req.params.id }, req.body, { new: true });
    return successResponse(res, tmpl, "Template updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/communication/template/:id
exports.deleteTemplate = async (req, res) => {
  try {
    await CommunicationTemplate.findOneAndDelete({ templateId: req.params.id });
    return successResponse(res, null, "Template deleted.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
