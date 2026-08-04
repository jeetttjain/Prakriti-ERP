const express = require("express");
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/user.controller");
const { resetUserPassword } = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize("User", "view"), getUsers);
router.post("/", authenticate, authorize("User", "create"), createUser);
router.put("/:id", authenticate, authorize("User", "edit"), updateUser);
router.delete("/:id", authenticate, authorize("User", "delete"), deleteUser);
router.post("/reset-password", authenticate, authorize("User", "edit"), resetUserPassword);

module.exports = router;
