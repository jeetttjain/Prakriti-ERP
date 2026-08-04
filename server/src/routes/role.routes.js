const express = require("express");
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require("../controllers/role.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorize("Role", "view"), getRoles);
router.post("/", authenticate, authorize("Role", "create"), createRole);
router.put("/:id", authenticate, authorize("Role", "edit"), updateRole);
router.delete("/:id", authenticate, authorize("Role", "delete"), deleteRole);

module.exports = router;
