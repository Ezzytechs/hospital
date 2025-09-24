const express = require("express");
const TenantUserController = require("./user.controller");
const tenantAuth = require("../../../middleware/tenantAuth");
const router = express.Router();

// GET all users
router.get("/", tenantAuth, TenantUserController.allUsers);

// GET user by ID (profile)
router.get("/:id", tenantAuth, TenantUserController.getUser);

// UPDATE user
router.put("/:id", tenantAuth, TenantUserController.updateUser);

// DELETE user
router.delete("/:id", tenantAuth, TenantUserController.deleteUser);

// ROLE breakdown
router.get("/stats/roles", tenantAuth, TenantUserController.roleBreakdown);

module.exports = router;
