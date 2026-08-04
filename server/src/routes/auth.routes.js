const express = require("express");
const router = express.Router();
const { login, logout, refresh, changePassword, getProfile } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.put("/change-password", authenticate, changePassword);
router.get("/profile", authenticate, getProfile);

module.exports = router;
