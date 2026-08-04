const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getTemplates,
  createNotification,
  sendNotification,
  retryNotification,
  cancelNotification,
  getPreferences,
  updatePreferences,
} = require("../controllers/notification.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize("Settings", "view"), getNotifications);
router.get("/templates", authenticate, authorize("Settings", "view"), getTemplates);
router.post("/", authenticate, authorize("Settings", "create"), createNotification);
router.post("/:id/send", authenticate, authorize("Settings", "edit"), sendNotification);
router.post("/:id/retry", authenticate, authorize("Settings", "edit"), retryNotification);
router.post("/:id/cancel", authenticate, authorize("Settings", "edit"), cancelNotification);
router.get("/preferences", authenticate, getPreferences);
router.put("/preferences", authenticate, updatePreferences);

module.exports = router;
