/**
 * Extract pagination parameters from a query object.
 * @param {object} query Request query object (e.g. req.query)
 * @param {object} [defaultSort={}] Default sort object if query doesn't specify one
 * @returns {object} { page, limit, skip, sort }
 */
const getPagination = (query, defaultSort = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = query.sort ? query.sort : defaultSort;
  return { page, limit, skip, sort };
};

/**
 * Builds a standardized pagination result payload.
 * @param {array} data Page items
 * @param {number} total Total count of matching documents
 * @param {number} page Current page number
 * @param {number} limit Page size limit
 * @param {string} [totalFieldName] Optional key name for total count field (e.g. 'totalCustomers')
 * @returns {object} Standard pagination JSON payload
 */
const buildPaginationResult = (data, total, page, limit, totalFieldName) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const totalRecords = Number(total) || 0;
  const totalPages = Math.ceil(totalRecords / limitNum) || 1;
  const hasNext = pageNum < totalPages;
  const hasPrevious = pageNum > 1;

  const result = {
    success: true,
    page: pageNum,
    limit: limitNum,
    totalRecords,
    totalPages,
    hasNext,
    hasPrevious,
    count: data ? data.length : 0,
    items: data || [],
    rows: data || [],
    data: data || [],
  };
  if (totalFieldName) {
    result[totalFieldName] = totalRecords;
  }
  return result;
};

module.exports = {
  getPagination,
  buildPaginationResult,
};
