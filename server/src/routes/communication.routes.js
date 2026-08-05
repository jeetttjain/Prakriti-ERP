const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/communication.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/messages", ctrl.getMessages);
router.get("/conversations", ctrl.getConversations);
router.get("/templates", ctrl.getTemplates);
router.get("/providers", ctrl.getProviders);
router.get("/preferences", ctrl.getPreferences);
router.get("/analytics", ctrl.getAnalytics);

router.post("/send", ctrl.sendMessage);
router.post("/template", ctrl.createTemplate);
router.post("/provider", ctrl.createProvider);
router.post("/campaign", ctrl.createCampaign);

router.patch("/retry/:id", ctrl.retryMessage);
router.patch("/cancel/:id", ctrl.cancelMessage);
router.patch("/approve/:id", ctrl.approveTemplate);
router.patch("/template/:id", ctrl.updateTemplate);
router.delete("/template/:id", ctrl.deleteTemplate);

module.exports = router;
