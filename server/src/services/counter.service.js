const Counter = require("../models/Counter");

/**
 * Generates an atomic sequential code/number for the given key and prefix.
 * @param {string} key Unique sequence identifier (e.g. 'orderNumber')
 * @param {string} [prefix] Optional prefix (e.g. 'ORD')
 * @param {number} [paddingLength=6] Pad length for the serial number
 * @returns {Promise<string>} Formatted serial code (e.g. 'ORD-000001')
 */
const generateCounter = async (key, prefix, paddingLength = 6) => {
  const result = await Counter.collection.findOneAndUpdate(
    { _id: key },
    { 
      $inc: { seq: 1 },
      $setOnInsert: { key: key }
    },
    { returnDocument: "after", upsert: true }
  );
  
  const doc = result && result.value ? result.value : result;
  const seq = doc.seq || 0;
  
  const sequenceStr = String(seq).padStart(paddingLength, "0");
  return prefix ? `${prefix}-${sequenceStr}` : sequenceStr;
};

module.exports = {
  generateCounter,
};
