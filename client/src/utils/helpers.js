/**
 * Generates a unique temporary client ID for items before they are persisted in database.
 * @returns {string} Unique client temporary ID
 */
export const generateTempId = () => {
  return `temp_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
};
