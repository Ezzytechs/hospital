const express = require("express");
const router = express.Router();
const tenantAuth = require("../../../middleware/tenantAuth");
const tenantAuthLogin = require("../../../middleware/tenantAuthLogin");
const TenantUserAuthController = require("./userAuth.controller");

// Login 
router.post("/login", tenantAuthLogin, TenantUserAuthController.login);

// Add new hospital user (must be tenant_admin)
router.post(
  "/add",
  tenantAuth,
  TenantUserAuthController.addUser
);

// OTP for password reset or email verification
router.post(
  "/generate-otp",
  tenantAuthLogin,
  TenantUserAuthController.generateOtp
);

// Reset password (with OTP)
router.post(
  "/reset-password",
  tenantAuthLogin,
  TenantUserAuthController.resetPassword
);

// Update password (while logged in)
router.post(
  "/update-password",
  tenantAuth,
  TenantUserAuthController.updatePassword
);

// Change email (while logged in)
router.post(
  "/change-email",
 tenantAuth,
  TenantUserAuthController.changeEmail
);

module.exports = router;
