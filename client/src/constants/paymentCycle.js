/**
 * Payment Terms Term Cycles (in days)
 * @constant
 * @type {Object}
 */
export const PAYMENT_CYCLE = {
  TERM_15: 15,
  TERM_30: 30
};
export const PAYMENT_CYCLE_LABELS = {
  [PAYMENT_CYCLE.TERM_15]: "15 Days Terms",
  [PAYMENT_CYCLE.TERM_30]: "30 Days Terms"
};
export const DEFAULT_PAYMENT_CYCLE = PAYMENT_CYCLE.TERM_15;
export const DEFAULT_CREDIT_LIMIT = 0;
