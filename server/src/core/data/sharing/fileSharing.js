const SharedLink = require("../../../models/SharedLink");

class FileSharing {
  /**
   * Generates a secure share link with expiry, password, and QR code access.
   */
  async createSharedLink(fileId, options = {}) {
    const shareId = `SHARE-${Date.now()}`;
    const accessKey = `KEY-${Math.random().toString(36).substr(2, 8)}`;

    const sharedDoc = await SharedLink.create({
      shareId,
      fileId,
      accessKey,
      isPasswordProtected: Boolean(options.password),
      passwordHash: options.password || null,
      expiresAt: options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      downloadLimit: options.downloadLimit || 0,
      isViewOnly: Boolean(options.isViewOnly),
    });

    return {
      shareId,
      fileId,
      accessKey,
      shareUrl: `/api/data/share/${shareId}?key=${accessKey}`,
      qrCodeUrl: `/api/export/qr/${shareId}.png`,
      expiresAt: sharedDoc.expiresAt,
    };
  }
}

module.exports = new FileSharing();
