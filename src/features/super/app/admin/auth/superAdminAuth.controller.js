const SuperAdminAuthService = require("./superAdminAuth.service");

class SuperAdminAuthController {
  /** Signup */
  static async signup(req, res) {
    try {
      const admin = await SuperAdminAuthService.signup(req.body, res);
      res.status(201).json(admin);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Signin */
  static async signin(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "email and/or password required" });
      const admin = await SuperAdminAuthService.signin(req.body, res);
      res.json(admin);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Generate OTP */
  static async generateOtp(req, res) {
    try {
      const otp = await SuperAdminAuthService.generateOtp(req.body.email);
      res.json({ message: "OTP generated successfully", otp });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Reset password */
  static async resetPassword(req, res) {
    try {
      await SuperAdminAuthService.resetPassword(req.body);
      res.json({ message: "Password reset successful" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Update password (requires auth) */
  static async updatePassword(req, res) {
    try {
      const { adminId } = req.superAdmin;
      await SuperAdminAuthService.updatePassword({
        adminId,
        ...req.body,
      });
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Change email */
  static async changeEmail(req, res) {
    try {
      const { adminId } = req.superAdmin;
      const admin = await SuperAdminAuthService.changeEmail({
        adminId,
        newEmail: req.body.newEmail,
      });
      res.json({ message: "Email updated successfully", admin });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  static async refreshToken(req, res) {
    try {
      const refreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }

      const { accessToken } = await SuperAdminAuthService.refreshToken(refreshToken, res);

      return res.json({
        message: "Token refreshed successfully",
        accessToken,
      });
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }
}

module.exports = SuperAdminAuthController;
