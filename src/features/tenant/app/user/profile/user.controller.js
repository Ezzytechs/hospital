const TenantUserService = require("./user.service");

class TenantUserController {
  /** All Users */
  static async allUsers(req, res) {
    try {
      if (req.user.role !== "tenant_admin")
        return res.status(403).json({ error: "Unauthorized!" });

      const { User } = req.db;
      const users = await TenantUserService.allUsers(User);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /** Get Profile */
  static async getUser(req, res) {
    try {
      const { User } = req.db;
      const user = await TenantUserService.getUser(User, req.params.id);

      if (!user) return res.status(404).json({ error: "User not found" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /** Update User */
  static async updateUser(req, res) {
    try {
      const id =
        req.user.role === "tenant_admin" ? req.params.id : req.user.userId;
      const { User } = req.db;
      const updatedUser = await TenantUserService.updateUser(
        User,
        id,
        req.body
      );

      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /** Delete User */
  static async deleteUser(req, res) {
    try {
      if (req.user.role !== "tenant_admin")
        return res.status(403).json({ error: "Unauthorized!" });

      const { User } = req.db;
      const deleted = await TenantUserService.deleteUser(User, req.params.id);

      if (!deleted) return res.status(404).json({ error: "User not found" });
      res.status(200).json({ error: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /** Role Breakdown */
  static async roleBreakdown(req, res) {
    try {
      if (req.user.role !== "tenant_admin")
        return res.status(403).json({ error: "Unauthorized!" });

      const { User } = req.db;
      const breakdown = await TenantUserService.roleBreakdown(User);

      res.status(200).json(breakdown);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = TenantUserController;
