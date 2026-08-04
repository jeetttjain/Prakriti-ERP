const Settings = require("../models/Settings");

/**
 * Retrieves the singular active ERP configuration Settings.
 * If no configuration exists, inserts a default document dynamically.
 */
const getSettings = async (session = null) => {
  let settings = await Settings.findOne().session(session);
  if (!settings) {
    settings = new Settings({});
    await settings.save({ session });
  }
  return settings;
};

/**
 * Updates ERP configuration Settings fields.
 */
const updateSettings = async (data, session = null) => {
  const settings = await getSettings(session);

  // Preserve feature and preferences nested structures if present
  if (data.features) {
    data.features = { ...settings.features, ...data.features };
  }
  if (data.preferences) {
    data.preferences = { ...settings.preferences, ...data.preferences };
  }

  // Assign keys
  Object.assign(settings, data);
  settings.lastUpdated = new Date();

  await settings.save({ session });
  return settings;
};

/**
 * Toggles status of specific catalog modules or features.
 */
const toggleModule = async (moduleField, enabledValue, session = null) => {
  const settings = await getSettings(session);

  // Support toggling nested feature fields
  if (moduleField.startsWith("features.")) {
    const featureName = moduleField.split(".")[1];
    if (settings.features) {
      settings.features[featureName] = !!enabledValue;
    }
  } else {
    settings[moduleField] = !!enabledValue;
  }

  settings.lastUpdated = new Date();
  await settings.save({ session });
  return settings;
};

module.exports = {
  getSettings,
  updateSettings,
  toggleModule,
};
