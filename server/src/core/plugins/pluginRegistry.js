/**
 * Plugin Registry for extending Automation Core with future provider integrations.
 */
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
  }

  /**
   * Registers a plugin instance.
   */
  register(pluginName, pluginInstance) {
    this.plugins.set(pluginName, {
      name: pluginName,
      instance: pluginInstance,
      registeredAt: new Date(),
      status: "ACTIVE",
    });
    console.log(`[PluginRegistry] Plugin '${pluginName}' registered successfully.`);
  }

  /**
   * Gets a registered plugin instance.
   */
  get(pluginName) {
    const p = this.plugins.get(pluginName);
    return p ? p.instance : null;
  }

  /**
   * Lists all registered plugins.
   */
  listPlugins() {
    return Array.from(this.plugins.values()).map((p) => ({
      name: p.name,
      registeredAt: p.registeredAt,
      status: p.status,
    }));
  }
}

module.exports = new PluginRegistry();
