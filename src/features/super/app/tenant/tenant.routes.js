const express = require("express");
const router = express.Router();
const TenantController = require("./tenant.controller");
const superAdminAuth = require('../../middleware/superAuth');

// CRUD routes
router.post("/", superAdminAuth, TenantController.createTenant);
router.get("/", superAdminAuth, TenantController.getAllTenants);
router.get("/:id", superAdminAuth, TenantController.getTenantById);
router.put("/:id", superAdminAuth, TenantController.updateTenant); 
router.delete("/:id", superAdminAuth, TenantController.deleteTenant);

module.exports = router;
