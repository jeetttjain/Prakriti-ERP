const mongoose = require("mongoose");

/**
 * Executes a callback within a MongoDB transaction session.
 * Automatically commits on success, aborts on failure, and ends the session.
 * If the database connection is a standalone MongoDB instance, it will print a warning
 * and gracefully fall back to executing the callback without a transaction session.
 * 
 * @param {function} callback Async function receiving (session)
 * @returns {Promise<any>} The result of the callback
 */
const executeTransaction = async (callback) => {
  let session;
  try {
    session = await mongoose.startSession();
  } catch (sessionErr) {
    console.warn("MongoDB sessions not supported, executing without transaction:", sessionErr.message);
    return await callback(null);
  }

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    const isStandaloneError = 
      error.message && 
      (error.message.includes("Transaction numbers are only allowed on a Replica Set member") || 
       error.code === 20);

    if (isStandaloneError && session.inTransaction()) {
      console.warn("Standalone MongoDB detected. Retrying operation without transaction.");
      await session.abortTransaction();
      session.endSession();
      return await callback(null);
    }

    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  executeTransaction,
};
