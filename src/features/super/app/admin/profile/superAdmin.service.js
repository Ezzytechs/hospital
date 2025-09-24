const SuperAdmin = require("./superAdmin.model");

class SuperAdminProfileService {
  /** Update profile */
  static async updateProfile(adminId, data) {
    const admin = await SuperAdmin.findByIdAndUpdate(adminId, data, {
      new: true,
    }).select("-password -otp -__v");
    if (!admin) throw new Error("Super admin not found");
    return admin;
  }

  /** Delete profile */
  static async deleteProfile(adminId) {
    const admin = await SuperAdmin.findByIdAndDelete(adminId);
    if (!admin) throw new Error("Super admin not found");
    return true;
  }

  /** Count all admins */
  static async countAdmins() {
    return SuperAdmin.countDocuments();
  }

  /** Get all admins */
  static async getAdminProfile(id) {
    return SuperAdmin.findById(id).select("-password -otp -__v"); // exclude password
  }
  
  /** Get all admins */
  static async getAllAdmins() {
    return SuperAdmin.find().select("-password -otp -__v"); // exclude password
  }
}

module.exports = SuperAdminProfileService;
