const crypto = require("crypto");
const EnterpriseFile = require("../../../models/EnterpriseFile");

class DeduplicationEngine {
  /**
   * Computes SHA-256 hash checksum for buffer or string.
   */
  calculateChecksum(dataBuffer) {
    return crypto.createHash("sha256").update(dataBuffer).digest("hex");
  }

  /**
   * Checks if an identical file exists via SHA-256 checksum.
   */
  async findDuplicate(checksum) {
    return EnterpriseFile.findOne({ checksum, isDeleted: false });
  }
}

module.exports = new DeduplicationEngine();
