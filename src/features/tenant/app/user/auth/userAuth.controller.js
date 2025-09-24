const TenantUserAuthService = require("./userAuth.service");

class TenantUserAuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const { User } = req.db; // models bound from tenantMiddleware
      const { subdomain } = req.tenant || {};

      const result = await TenantUserAuthService.login(
        User,
        email,
        password,
        subdomain,
        res
      );

      res.json({
        token: result.accessToken,
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role,
        },
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async addUser(req, res) {
    try {
      const { User } = req.db;

      if (req.user.role !== "tenant_admin") {
        return res
          .status(403)
          .json({ message: "Only admin can add users" });
      }

      const newUser = await TenantUserAuthService.addUser(User, req.body);
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async generateOtp(req, res) {
    try {
      const { User } = req.db;
      const { email } = req.body;

      const otp = await TenantUserAuthService.generateOtp(User, email);
      res.json({ message: "OTP generated", otp });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { User } = req.db;
      const { email, otp, newPassword } = req.body;

      await TenantUserAuthService.resetPassword(User, email, otp, newPassword);
      res.json({ message: "Password reset successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updatePassword(req, res) {
    try {
      const { User } = req.db;
      const { oldPassword, newPassword } = req.body;

      await TenantUserAuthService.updatePassword(
        User,
        req.user,
        oldPassword,
        newPassword
      );
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async changeEmail(req, res) {
    try {
      const { User } = req.db;
      const { newEmail } = req.body;

      await TenantUserAuthService.changeEmail(User, req.user, newEmail);
      res.json({ message: "Email updated successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = TenantUserAuthController;
