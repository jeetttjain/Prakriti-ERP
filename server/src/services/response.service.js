const { buildPaginationResult } = require("./pagination.service");

/**
 * Standard Success Response Helper
 * @param {object} res Express response object
 * @param {any} data Response data payload
 * @param {string} [message] Success message
 * @param {number} [statusCode=200] HTTP Status code
 */
exports.successResponse = (res, data, message, statusCode = 200) => {
  const response = { success: true };
  if (message !== undefined) response.message = message;
  if (data !== undefined) {
    if (Array.isArray(data)) {
      response.count = data.length;
    }
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

/**
 * Standard Error Response Helper
 * @param {object} res Express response object
 * @param {string} [message="Internal Server Error"] Error message
 * @param {number} [statusCode=500] HTTP Status code
 * @param {any} [errors=null] Optional validation errors or details
 */
exports.errorResponse = (res, message = "Internal Server Error", statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Standard Paginated Response Helper
 * @param {object} res Express response object
 * @param {array} data Array of items
 * @param {number} page Current page number
 * @param {number} limit Page size limit
 * @param {number} total Total count of records
 * @param {string} totalFieldName Key name for total count field (e.g., 'totalCustomers')
 */
exports.paginatedResponse = (res, data, page, limit, total, totalFieldName) => {
  const result = buildPaginationResult(data, total, page, limit, totalFieldName);
  return res.status(200).json(result);
};
