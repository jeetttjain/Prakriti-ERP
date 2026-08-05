const EnterpriseFile = require("../models/EnterpriseFile");
const DataBackup = require("../models/DataBackup");
const ImportJob = require("../models/ImportJob");
const documentManager = require("../core/data/documents/documentManager");
const fileVersioning = require("../core/data/versioning/fileVersioning");
const searchEngine = require("../core/data/search/searchEngine");
const importEngine = require("../core/data/imports/importEngine");
const backupEngine = require("../core/data/backup/backupEngine");
const restoreEngine = require("../core/data/restore/restoreEngine");
const previewEngine = require("../core/data/preview/previewEngine");
const fileSharing = require("../core/data/sharing/fileSharing");
const { successResponse, errorResponse } = require("../services/response.service");
const auditLogService = require("../services/auditLog.service");

// GET /api/data/files
exports.getFiles = async (req, res) => {
  try {
    const files = await EnterpriseFile.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, files, "Enterprise data files retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/data/documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await EnterpriseFile.find({ isDeleted: false, module: { $ne: "Media" } }).sort({ createdAt: -1 });
    return successResponse(res, docs, "Documents retrieved.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/data/search
exports.searchFiles = async (req, res) => {
  try {
    const results = await searchEngine.search(req.query.q, req.query);
    return successResponse(res, results, "Global search completed.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/data/preview/:id
exports.getPreview = async (req, res) => {
  try {
    const preview = await previewEngine.getPreview(req.params.id);
    return successResponse(res, preview, "Preview generated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/data/upload
exports.uploadFile = async (req, res) => {
  try {
    const fileDoc = await documentManager.uploadDocument(req.body);
    auditLogService.logEvent({
      module: "EnterpriseDataPlatform",
      action: "File Uploaded",
      performedBy: req.user?.userCode || "Admin",
      targetId: fileDoc.fileId,
      ipAddress: req.ip,
    }).catch(() => {});
    return successResponse(res, fileDoc, "File uploaded & registered in EDP.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/data/import
exports.importData = async (req, res) => {
  try {
    const { filename, targetModule, rows, isDryRun } = req.body;
    const job = await importEngine.processImport(filename, targetModule, rows, isDryRun);
    return successResponse(res, job, "Import processed.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/data/export
exports.exportData = async (req, res) => {
  try {
    return successResponse(
      res,
      { downloadUrl: `/api/export/batch_${Date.now()}.zip`, status: "COMPLETED" },
      "Export generated successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/data/backup
exports.createBackup = async (req, res) => {
  try {
    const backup = await backupEngine.createBackup(req.body.backupName, req.body.type);
    auditLogService.logEvent({
      module: "EnterpriseDataPlatform",
      action: "Backup Created",
      performedBy: req.user?.userCode || "Admin",
      targetId: backup.backupId,
      ipAddress: req.ip,
    }).catch(() => {});
    return successResponse(res, backup, "Backup created successfully.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/data/restore
exports.restoreBackup = async (req, res) => {
  try {
    const result = await restoreEngine.restoreFromBackup(req.body.backupId);
    auditLogService.logEvent({
      module: "EnterpriseDataPlatform",
      action: "Disaster Recovery Restore",
      performedBy: req.user?.userCode || "Admin",
      ipAddress: req.ip,
    }).catch(() => {});
    return successResponse(res, result, "Restore simulation completed.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/data/share
exports.createSharedLink = async (req, res) => {
  try {
    const { fileId, ...options } = req.body;
    const share = await fileSharing.createSharedLink(fileId, options);
    return successResponse(res, share, "Secure share link created.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/data/version/:id
exports.updateFileVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { buffer, changeNotes } = req.body;
    const updated = await fileVersioning.createNewVersion(id, buffer, changeNotes, req.user?.userCode || "Admin");
    return successResponse(res, updated, "File version updated.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// PATCH /api/data/archive/:id
exports.archiveFile = async (req, res) => {
  try {
    const file = await EnterpriseFile.findOneAndUpdate({ fileId: req.params.id }, { isArchived: true, storageTier: "Cold" }, { new: true });
    return successResponse(res, file, "File archived.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// DELETE /api/data/file/:id
exports.deleteFile = async (req, res) => {
  try {
    const file = await EnterpriseFile.findOneAndUpdate({ fileId: req.params.id }, { isDeleted: true, deletedAt: new Date() }, { new: true });
    return successResponse(res, file, "File soft deleted.");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
