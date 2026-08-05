const EnterpriseFile = require("../../../models/EnterpriseFile");
const storageManager = require("../storage/storageManager");
const deduplicationEngine = require("../deduplication/deduplicationEngine");
const eventPublisher = require("../../events/eventPublisher");
const { EVENTS } = require("../../events/eventRegistry");

class DocumentManager {
  /**
   * Registers & uploads a document to EDP with SHA-256 deduplication.
   */
  async uploadDocument(fileData = {}) {
    const { filename, originalName, mimeType, buffer, module = "General", entityId, owner = "Admin", classification = "Internal" } = fileData;
    const buf = buffer || Buffer.from(fileData.content || "Sample document content");
    const checksum = deduplicationEngine.calculateChecksum(buf);

    // Deduplication check
    const existing = await deduplicationEngine.findDuplicate(checksum);
    if (existing) {
      existing.refCount += 1;
      await existing.save();
      console.log(`[DocumentManager] Duplicate detected. Reusing file ${existing.fileId} (RefCount: ${existing.refCount})`);
      return existing;
    }

    // Store File
    const finalFilename = `${Date.now()}_${filename || originalName || "file.dat"}`;
    const stored = await storageManager.storeFile(finalFilename, buf);

    const fileId = `EDP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const fileDoc = await EnterpriseFile.create({
      fileId,
      filename: finalFilename,
      originalName: originalName || filename || "file.dat",
      mimeType: mimeType || "application/octet-stream",
      size: buf.length,
      checksum,
      refCount: 1,
      storageProvider: stored.provider,
      storagePath: stored.storagePath,
      module,
      entityId,
      owner,
      securityClassification: classification,
    });

    // Emit Event to Event Bus
    eventPublisher.publish(EVENTS.PRODUCT_CREATED || "FILE_UPLOADED", fileDoc.toObject(), { producerModule: "EDP" }).catch(() => {});

    return fileDoc;
  }
}

module.exports = new DocumentManager();
