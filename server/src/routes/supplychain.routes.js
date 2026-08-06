const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/supplychain.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/branches", ctrl.getBranches);
router.get("/warehouses", ctrl.getWarehouses);
router.get("/inventory", ctrl.getInventory);
router.get("/transfers", ctrl.getTransfers);
router.get("/procurement", ctrl.getProcurement);
router.get("/dispatch", ctrl.getDispatch);
router.get("/routes", ctrl.getRoutes);
router.get("/suppliers", ctrl.getSuppliers);
router.get("/analytics", ctrl.getAnalytics);

router.post("/transfer", ctrl.createTransfer);
router.post("/receive", ctrl.receiveProcurement);
router.post("/dispatch", ctrl.createDispatch);
router.post("/route", ctrl.createRoute);
router.post("/audit", ctrl.conductAudit);

router.patch("/inventory", ctrl.updateInventory);
router.delete("/transfer/:id", ctrl.cancelTransfer);

module.exports = router;
