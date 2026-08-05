const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema(
  {
    versionId: { type: String, required: true, unique: true },
    fileId: { type: String, required: true, index: true },
    versionNumber: { type: Number, required: true },
    filename: { type: String, required: true },
    storagePath: { type: String, required: true },
    checksum: { type: String, required: true },
    size: { type: Number, required: true },
    changeNotes: { type: String, default: "Updated version" },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileVersion", fileVersionSchema);
