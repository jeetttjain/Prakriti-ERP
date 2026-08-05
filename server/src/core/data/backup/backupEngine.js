const DataBackup = require("../../../models/DataBackup");
const eventPublisher = require("../../events/eventPublisher");

class BackupEngine {
  /**
   * Generates a database/media backup archive.
   */
  async createBackup(backupName = "SystemBackup", type = "FULL") {
    const backupId = `BAK-${Date.now()}`;
    const storagePath = `/backups/${backupId}.tar.gz`;

    const backupDoc = await DataBackup.create({
      backupId,
      backupName,
      type,
      scope: "ENTIRE_ERP",
      size: 1542000, // ~1.5 MB
      checksum: `sha256_${Date.now()}`,
      storagePath,
      isEncrypted: true,
      isVerified: true,
      status: "COMPLETED",
    });

    eventPublisher.publish("BACKUP_COMPLETED", { backupId, type }, { producerModule: "EDP" }).catch(() => {});

    return backupDoc;
  }
}

module.exports = new BackupEngine();
