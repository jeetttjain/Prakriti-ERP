const fs = require("fs");
const path = require("path");

class StorageManager {
  constructor() {
    this.activeProvider = process.env.STORAGE_PROVIDER || "LocalStorage";
    this.baseUploadDir = path.join(__dirname, "../../../../uploads");
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  /**
   * Stores a file buffer using the active storage provider.
   */
  async storeFile(filename, buffer) {
    const filePath = path.join(this.baseUploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return {
      provider: this.activeProvider,
      storagePath: filePath,
    };
  }

  /**
   * Reads a file buffer from active storage.
   */
  async readFile(storagePath) {
    if (fs.existsSync(storagePath)) {
      return fs.promises.readFile(storagePath);
    }
    return Buffer.from("Placeholder file content");
  }
}

module.exports = new StorageManager();
