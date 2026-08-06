const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/systemControl.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/modules", ctrl.getModules);
router.get("/services", ctrl.getServices);
router.get("/flags", ctrl.getFlags);
router.get("/configuration", ctrl.getConfigurations);
router.get("/maintenance", ctrl.getMaintenance);
router.get("/snapshots", ctrl.getSnapshots);
router.get("/timeline", ctrl.getTimeline);

router.post("/module/start", ctrl.startModule);
router.post("/module/stop", ctrl.stopModule);
router.post("/module/restart", ctrl.restartModule);
router.post("/feature/enable", ctrl.enableFeature);
router.post("/feature/disable", ctrl.disableFeature);
router.post("/maintenance/start", ctrl.startMaintenance);
router.post("/maintenance/stop", ctrl.stopMaintenance);
router.post("/snapshot/create", ctrl.createSnapshot);
router.post("/snapshot/restore", ctrl.restoreSnapshot);
router.post("/emergency", ctrl.triggerEmergency);

router.patch("/configuration", ctrl.updateConfiguration);

module.exports = router;
