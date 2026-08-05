const EnterpriseFile = require("../../../models/EnterpriseFile");
const FileVersion = require("../../../models/FileVersion");
const storageManager = require("../storage/storageManager");
const deduplicationEngine = require("../deduplication/deduplicationEngine");

class FileVersioning {
  /**
   * Creates a new version revision for an existing file document.
   */
  async createNewVersion(fileId, buffer, changeNotes = "Updated version", user = "Admin") {
    const fileDoc = await EnterpriseFile.findOne({ fileId });
    if (!fileDoc) throw new Error("Enterprise file document not found.");

    // Archive current state into FileVersion history
    const versionId = `VER-${Date.now()}`;
    await FileVersion.create({
      versionId,
      fileId: fileDoc.fileId,
      versionNumber: fileDoc.version,
      filename: fileDoc.filename,
      storagePath: fileDoc.storagePath,
      checksum: fileDoc.checksum,
      size: fileDoc.size,
      changeNotes,
      createdBy: user,
    });

    // Save new file version data
    const buf = buffer || Buffer.from("Updated file content");
    const checksum = deduplicationEngine.calculateChecksum(buf);
    const newFilename = `${Date.now()}_v${fileDoc.version + 1}_${fileDoc.originalName}`;
    const stored = await storageManager.storeFile(newFilename, buf);

    fileDoc.filename = newFilename;
    fileDoc.storagePath = stored.storagePath;
    fileDoc.checksum = checksum;
    fileDoc.size = buf.length;
    fileDoc.version += 1;
    fileDoc.updatedBy = user;
    await fileDoc.save();

    return fileDoc;
  }

  /**
   * Rolls back a file to a previous version number.
   */
  async rollbackVersion(fileId, targetVersionNumber) {
    const fileDoc = await EnterpriseFile.findOne({ fileId });
    if (!fileDoc) throw new Error("Enterprise file document not found.");

    const oldVersion = await FileVersion.findOne({ fileId, versionNumber: targetVersionNumber });
    if (!oldVersion) throw new Error(`Version ${targetVersionNumber} not found in history.`);

    fileDoc.filename = oldVersion.filename;
    fileDoc.storagePath = oldVersion.storagePath;
    fileDoc.checksum = oldVersion.checksum;
    fileDoc.size = oldVersion.size;
    fileDoc.version += 1;
    fileDoc.updatedBy = "RollbackSystem";
    await fileDoc.save();

    return fileDoc;
  }
}

module.exports = new FileVersioning();
