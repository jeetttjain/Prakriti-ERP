const cacheStore = new Map();

/**
 * Get a value from the cache. Expiry is automatically checked.
 * @param {string} key
 * @returns {any|null} The cached value or null if missed/expired
 */
const get = (key) => {
  const item = cacheStore.get(key);
  if (!item) return null;

  if (item.expiry && Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return item.value;
};

/**
 * Set a key-value pair in the cache with optional TTL.
 * @param {string} key Cache key
 * @param {any} value Cache value
 * @param {number} [ttl] Time-to-live in seconds
 * @returns {boolean} True if successfully stored
 */
const set = (key, value, ttl) => {
  const expiry = ttl ? Date.now() + ttl * 1000 : null;
  cacheStore.set(key, { value, expiry });
  return true;
};

/**
 * Delete a cache entry.
 * @param {string} key Cache key
 * @returns {boolean} True if the key existed and was deleted
 */
const deleteKey = (key) => {
  return cacheStore.delete(key);
};

/**
 * Clear all cache entries.
 * @returns {boolean} True on success
 */
const clear = () => {
  cacheStore.clear();
  return true;
};

/**
 * Registry of all report-related cache keys.
 * Add new report keys here to have them automatically invalidated
 * by invalidateReportCaches() whenever any mutating operation runs.
 */
const REPORT_CACHE_KEYS = [
  "dashboard_summary_report",
  // future keys: "sales_report_cache", "inventory_report_cache", etc.
];

/**
 * Invalidates all registered report caches in a single call.
 * Called after every mutating operation in Order, Invoice, Payment,
 * Purchase, and Inventory controllers so dashboards reflect live data.
 */
const invalidateReportCaches = () => {
  REPORT_CACHE_KEYS.forEach((key) => cacheStore.delete(key));
};

module.exports = {
  get,
  set,
  delete: deleteKey,
  clear,
  invalidateReportCaches,
};
