const SuperAdminProfileService = require("./superAdmin.service");

class SuperAdminProfileController {
  /** Update profile */
  static async updateProfile(req, res) {
    try {
      const id = req.superAdmin.adminId;
     const data = {
        ...req.body,
      };
      delete data.password;
      const admin = await SuperAdminProfileService.updateProfile(id, data);
      res.json({ message: "Profile updated successfully", admin });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  static async adminProfile(req, res) {
    try {
      const id = req.superAdmin.adminId;
      const admin = await SuperAdminProfileService.getAdminProfile(id);
      res.json({ message: "Profile updated successfully", admin });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Delete profile */
  static async deleteProfile(req, res) {
    try {
      const id = req.superAdmin.adminId;
      await SuperAdminProfileService.deleteProfile(id);
      res.json({ message: "Profile deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Count admins */
  static async countAdmins(req, res) {
    try {
      const count = await SuperAdminProfileService.countAdmins();
      res.json({ count });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  /** Get all admins */
  static async getAllAdmins(req, res) {
    try {
      const admins = await SuperAdminProfileService.getAllAdmins();
      res.json(admins);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = SuperAdminProfileController;
