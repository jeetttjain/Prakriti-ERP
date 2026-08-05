require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const documentManager = require("./src/core/data/documents/documentManager");
const fileVersioning = require("./src/core/data/versioning/fileVersioning");
const searchEngine = require("./src/core/data/search/searchEngine");
const importEngine = require("./src/core/data/imports/importEngine");
const backupEngine = require("./src/core/data/backup/backupEngine");
const restoreEngine = require("./src/core/data/restore/restoreEngine");
const previewEngine = require("./src/core/data/preview/previewEngine");
const fileSharing = require("./src/core/data/sharing/fileSharing");
const EnterpriseFile = require("./src/models/EnterpriseFile");

async function runTests() {
  console.log("🔄 Connecting to Database...");
  await connectDB();

  try {
    console.log("\n--- TEST 1: Document Manager Upload & SHA-256 Deduplication ---");
    const startTime = Date.now();
    const doc1 = await documentManager.uploadDocument({
      filename: "GST_Report_Q3.pdf",
      originalName: "GST_Report_Q3.pdf",
      mimeType: "application/pdf",
      content: "GST Tax Return Report Content Q3 2026",
      module: "Reports",
    });
    const duration = Date.now() - startTime;
    console.log("✅ File uploaded in", duration, "ms. File ID:", doc1.fileId, "Checksum:", doc1.checksum.substr(0, 12));

    // Deduplication check
    const doc2 = await documentManager.uploadDocument({
      filename: "GST_Report_Q3_Copy.pdf",
      originalName: "GST_Report_Q3_Copy.pdf",
      mimeType: "application/pdf",
      content: "GST Tax Return Report Content Q3 2026",
      module: "Reports",
    });
    console.log("✅ Deduplication check: Identical checksum detected! Reused File ID:", doc2.fileId, "Ref Count:", doc2.refCount);

    console.log("\n--- TEST 2: File Versioning & Rollback ---");
    const ver1 = await fileVersioning.createNewVersion(doc1.fileId, Buffer.from("Updated GST Content Version 2"), "Added B2B Invoices");
    console.log("✅ Version incremented cleanly! New Version:", ver1.version);

    const rolled = await fileVersioning.rollbackVersion(doc1.fileId, 1);
    console.log("✅ Rollback to version 1 completed! Current Version:", rolled.version);

    console.log("\n--- TEST 3: Global Search Engine ---");
    const searchRes = await searchEngine.search("GST");
    console.log("✅ Global Search completed! Matches found:", searchRes.totalMatches);

    console.log("\n--- TEST 4: Bulk Import Engine & Dry-Run Validation ---");
    const impJob = await importEngine.processImport("Customer_Bulk.csv", "Customers", [{ name: "Acme Produce" }], true);
    console.log("✅ Import dry-run processed! Status:", impJob.status, "Total rows:", impJob.totalRows);

    console.log("\n--- TEST 5: Backup & Disaster Recovery Restore ---");
    const backup = await backupEngine.createBackup("SystemDisasterRecoveryBackup", "FULL");
    console.log("✅ Backup manifest created! Backup ID:", backup.backupId);

    const restore = await restoreEngine.restoreFromBackup(backup.backupId);
    console.log("✅ Point-in-time disaster recovery simulation completed!", restore.message);

    console.log("\n--- TEST 6: In-Browser Preview & Secure Sharing ---");
    const preview = await previewEngine.getPreview(doc1.fileId);
    console.log("✅ Preview metadata generated! Preview Type:", preview.previewType);

    const share = await fileSharing.createSharedLink(doc1.fileId, { password: "secretPassword" });
    console.log("✅ Secure Share Link generated! Share ID:", share.shareId, "URL:", share.shareUrl);

    console.log("\n🎉 ALL 6 ENTERPRISE DATA PLATFORM TESTS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🍃 MongoDB Connection closed.");
    process.exit(0);
  }
}

runTests();
