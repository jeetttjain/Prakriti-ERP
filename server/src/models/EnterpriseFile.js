const mongoose = require("mongoose");

const enterpriseFileSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    checksum: { type: String, required: true, index: true }, // SHA-256 Hash
    refCount: { type: Number, default: 1 }, // Reference count for deduplication
    storageProvider: { type: String, enum: ["LocalStorage", "GridFS", "Cloudinary", "AWS_S3", "AzureBlob", "GCP"], default: "LocalStorage" },
    storagePath: { type: String, required: true },
    storageTier: { type: String, enum: ["Hot", "Warm", "Cold", "Offline"], default: "Hot" },
    module: { type: String, default: "General" },
    entityType: { type: String },
    entityId: { type: String },
    owner: { type: String, default: "SYSTEM" },
    branch: { type: String, default: "Main Branch" },
    securityClassification: { type: String, enum: ["Public", "Internal", "Confidential", "Restricted", "Legal Hold"], default: "Internal" },
    tags: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: String, default: "SYSTEM" },
    updatedBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnterpriseFile", enterpriseFileSchema);
