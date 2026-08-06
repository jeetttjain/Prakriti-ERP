/**
 * Centralized Phone Normalization & Format Utility for Prakriti ERP (Client)
 */

/**
 * Escapes special characters for safe regular expression generation.
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes phone number into a clean 10-digit Indian mobile number string.
 * Strips spaces, dashes, brackets, dots, country code (+91, 91, 0).
 * e.g., "+91 98290 11111" -> "9829011111"
 *       "91-9829011111"    -> "9829011111"
 *       "09829011111"      -> "9829011111"
 * @param {string} phoneStr
 * @returns {string}
 */
export function normalizePhone(phoneStr) {
  if (!phoneStr) return "";
  let digits = String(phoneStr).replace(/\D/g, "");

  // Remove leading country code 91 if 12 digits
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // Remove leading 0 if 11 digits
  else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Formats clean 10-digit number for display: "+91 9829011111"
 * @param {string} phoneStr
 * @returns {string}
 */
export function formatPhone(phoneStr) {
  if (!phoneStr) return "";
  const normalized = normalizePhone(phoneStr);
  if (!normalized) return "";
  if (normalized.length === 10) {
    return `+91 ${normalized}`;
  }
  return String(phoneStr);
}

/**
 * Validates 10-digit Indian mobile number format (starts with 6-9).
 * @param {string} phoneStr
 * @returns {boolean}
 */
export function validatePhone(phoneStr) {
  const normalized = normalizePhone(phoneStr);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Compares two phone strings for equality after normalization.
 * @param {string} p1
 * @param {string} p2
 * @returns {boolean}
 */
export function comparePhone(p1, p2) {
  return normalizePhone(p1) === normalizePhone(p2);
}
