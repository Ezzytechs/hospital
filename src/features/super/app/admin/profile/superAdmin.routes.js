const express = require("express");
const router = express.Router();
const SuperAdminProfileController = require("./superAdmin.controller");
const superAdminAuth = require("../../../middleware/superAuth"); // JWT middleware

// Protected routes
router.put("/update", superAdminAuth, SuperAdminProfileController.updateProfile);
router.delete("/delete", superAdminAuth, SuperAdminProfileController.deleteProfile);

// Admin management
router.get("/count", superAdminAuth, SuperAdminProfileController.countAdmins);
router.get("/all", superAdminAuth, SuperAdminProfileController.getAllAdmins);

module.exports = router;
