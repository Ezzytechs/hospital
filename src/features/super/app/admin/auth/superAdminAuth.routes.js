const express = require("express");
const router = express.Router();
const SuperAdminAuthController = require("./superAdminAuth.controller");
const superAdminAuth = require("../../../middleware/superAuth"); // JWT middleware

//*****PROTECT SUPER ADMIN SIGN UP ON PRODUCTION****/
// Public
router.post("/signup", SuperAdminAuthController.signup);
router.post("/signin", SuperAdminAuthController.signin);
router.post("/generate-otp", SuperAdminAuthController.generateOtp);
router.post("/reset-password", SuperAdminAuthController.resetPassword);

// Protected
router.put(
  "/update-password",
  superAdminAuth,
  SuperAdminAuthController.updatePassword
);
router.post(
  "/change-email",
  superAdminAuth,
  SuperAdminAuthController.changeEmail
);
router.post("/refresh", SuperAdminAuthController.refreshToken);


module.exports = router;
