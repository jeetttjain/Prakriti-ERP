const mongoose = require("mongoose");
const EnterpriseFile = require("../../../models/EnterpriseFile");

class PreviewEngine {
  /**
   * Generates in-browser preview metadata and HTML renderers.
   */
  async getPreview(fileId) {
    const query = mongoose.Types.ObjectId.isValid(fileId)
      ? { $or: [{ _id: fileId }, { fileId }] }
      : { fileId };
    const file = await EnterpriseFile.findOne(query);
    if (!file) throw new Error("File not found for preview.");

    let previewType = "TEXT";
    if (file.mimeType.includes("pdf")) previewType = "PDF";
    else if (file.mimeType.includes("image")) previewType = "IMAGE";
    else if (file.mimeType.includes("sheet") || file.mimeType.includes("csv")) previewType = "SPREADSHEET";

    return {
      fileId: file.fileId,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      previewType,
      htmlPreview: `<div style="padding:20px; font-family:sans-serif;"><h3>In-Browser Preview for ${file.originalName}</h3><p>MIME Type: ${file.mimeType} (${file.size} bytes)</p></div>`,
      downloadUrl: `/api/data/download/${file.fileId}`,
    };
  }
}

module.exports = new PreviewEngine();
