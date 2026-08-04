const mongoose = require("mongoose");

/**
 * UTC Date Normalization
 * Converts `from` to UTC Start Of Day (00:00:00.000Z)
 * Converts `to` to UTC End Of Day (23:59:59.999Z)
 * @param {string|Date} from 
 * @param {string|Date} to 
 * @param {string} [dateField="createdAt"] 
 * @returns {object} Query filter condition
 */
const buildDateFilter = (from, to, dateField = "createdAt") => {
  if (!from && !to) return {};

  const filter = {};
  const range = {};

  if (from) {
    const startDate = new Date(from);
    if (!isNaN(startDate.getTime())) {
      startDate.setUTCHours(0, 0, 0, 0);
      range.$gte = startDate;
    }
  }

  if (to) {
    const endDate = new Date(to);
    if (!isNaN(endDate.getTime())) {
      endDate.setUTCHours(23, 59, 59, 999);
      range.$lte = endDate;
    }
  }

  if (Object.keys(range).length > 0) {
    filter[dateField] = range;
  }

  return filter;
};

/**
 * Reusable entity filter builder.
 * Validates ObjectIds for customerId, supplierId, productId, categoryId, etc.
 * @param {object} params 
 * @returns {object} Query filter condition
 */
const buildEntityFilter = (params = {}) => {
  const filter = {};

  if (params.customerId && mongoose.Types.ObjectId.isValid(params.customerId)) {
    filter.customerId = new mongoose.Types.ObjectId(params.customerId);
  }

  if (params.supplierId && mongoose.Types.ObjectId.isValid(params.supplierId)) {
    filter.supplierId = new mongoose.Types.ObjectId(params.supplierId);
  }

  if (params.productId && mongoose.Types.ObjectId.isValid(params.productId)) {
    filter.productId = new mongoose.Types.ObjectId(params.productId);
  }

  if (params.categoryId && mongoose.Types.ObjectId.isValid(params.categoryId)) {
    filter.categoryId = new mongoose.Types.ObjectId(params.categoryId);
  } else if (params.category) {
    filter.category = params.category;
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

/**
 * Reusable text search filter helper.
 * Builds `$or` regex filter across specified search fields.
 * @param {string} search 
 * @param {string[]} searchFields 
 * @returns {object} Query filter condition
 */
const buildSearchFilter = (search, searchFields = []) => {
  if (!search || typeof search !== "string" || search.trim() === "" || !searchFields || searchFields.length === 0) {
    return {};
  }

  const sanitized = search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(sanitized, "i");

  return {
    $or: searchFields.map((field) => ({ [field]: regex })),
  };
};

/**
 * Reusable sort options builder.
 * Returns sort object `{ [sortBy]: sortOrder }`.
 * @param {string} sortBy 
 * @param {string|number} sortOrder 
 * @param {string} [defaultSortBy="createdAt"] 
 * @param {string|number} [defaultSortOrder=-1] 
 * @returns {object} Sort object
 */
const buildSortOptions = (sortBy, sortOrder, defaultSortBy = "createdAt", defaultSortOrder = -1) => {
  const field = sortBy || defaultSortBy;
  let order = -1;

  if (sortOrder !== undefined && sortOrder !== null) {
    if (sortOrder === "asc" || sortOrder === "1" || sortOrder === 1) {
      order = 1;
    } else if (sortOrder === "desc" || sortOrder === "-1" || sortOrder === -1) {
      order = -1;
    }
  } else {
    if (defaultSortOrder === "asc" || defaultSortOrder === "1" || defaultSortOrder === 1) {
      order = 1;
    }
  }

  return { [field]: order };
};

/**
 * Reusable pagination options builder.
 * @param {number|string} page 
 * @param {number|string} limit 
 * @returns {object} { page, limit, skip }
 */
const buildPagination = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(500, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, skip };
};

/**
 * Merges multiple query filter objects safely.
 * Includes soft-delete exclusion (`isDeleted: { $ne: true }`).
 * @param {...object} filters 
 * @returns {object} Consolidated query match condition
 */
const mergeFilters = (...filters) => {
  const nonDeletedFilter = { isDeleted: { $ne: true } };
  const validFilters = filters.filter((f) => f && typeof f === "object" && Object.keys(f).length > 0);

  if (validFilters.length === 0) {
    return nonDeletedFilter;
  }

  return {
    $and: [nonDeletedFilter, ...validFilters],
  };
};

module.exports = {
  buildDateFilter,
  buildEntityFilter,
  buildSearchFilter,
  buildSortOptions,
  buildPagination,
  mergeFilters,
};
