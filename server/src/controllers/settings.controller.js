const settingsService = require("../services/settings.service");
const { successResponse, errorResponse } = require("../services/response.service");

// GET SETTINGS
exports.getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    return successResponse(res, settings);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE SETTINGS
exports.updateSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    return successResponse(res, settings, "Settings updated successfully.");
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// TOGGLE MODULE
exports.toggleModule = async (req, res) => {
  try {
    const { field, value } = req.body;
    if (!field) {
      return errorResponse(res, "Field identifier is required.", 400);
    }
    const settings = await settingsService.toggleModule(field, value);
    return successResponse(res, settings, `Module '${field}' status toggled successfully.`);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
