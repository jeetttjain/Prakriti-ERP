const mongoose = require("mongoose");

const sharedLinkSchema = new mongoose.Schema(
  {
    shareId: { type: String, required: true, unique: true },
    fileId: { type: String, required: true },
    accessKey: { type: String, required: true },
    isPasswordProtected: { type: Boolean, default: false },
    passwordHash: { type: String },
    expiresAt: { type: Date },
    downloadLimit: { type: Number, default: 0 }, // 0 = unlimited
    downloadCount: { type: Number, default: 0 },
    isViewOnly: { type: Boolean, default: false },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedLink", sharedLinkSchema);
