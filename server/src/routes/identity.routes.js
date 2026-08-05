const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/identity.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Unauthenticated Login Endpoint
router.post("/login", ctrl.login);

// Authenticated Endpoints
router.use(authenticate);

router.post("/logout", ctrl.logout);
router.get("/users", ctrl.getUsers);
router.get("/sessions", ctrl.getSessions);
router.get("/devices", ctrl.getDevices);
router.get("/apikeys", ctrl.getApiKeys);
router.get("/security", ctrl.getSecurityConfig);

router.post("/session/revoke", ctrl.revokeSession);
router.post("/device/trust", ctrl.trustDevice);
router.post("/device/block", ctrl.blockDevice);
router.post("/apikey", ctrl.createApiKey);

router.patch("/security-policy", ctrl.updateSecurityPolicy);
router.delete("/apikey/:id", ctrl.deleteApiKey);

module.exports = router;
