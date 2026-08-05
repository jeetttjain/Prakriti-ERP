const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/enterpriseData.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/files", ctrl.getFiles);
router.get("/documents", ctrl.getDocuments);
router.get("/search", ctrl.searchFiles);
router.get("/preview/:id", ctrl.getPreview);

router.post("/upload", ctrl.uploadFile);
router.post("/import", ctrl.importData);
router.post("/export", ctrl.exportData);
router.post("/backup", ctrl.createBackup);
router.post("/restore", ctrl.restoreBackup);
router.post("/share", ctrl.createSharedLink);

router.patch("/version/:id", ctrl.updateFileVersion);
router.patch("/archive/:id", ctrl.archiveFile);
router.delete("/file/:id", ctrl.deleteFile);

module.exports = router;
