class TenantUserService {
  /** Get all users */
  static async allUsers(User) {
    return await User.find().select("-password -otp");
  }

  /** Get single user profile */
  static async getUser(User, userId) {
    return await User.findById(userId).select("-password -otp");
  }

  /** Update user */
  static async updateUser(User, userId, updateData) {
    if (updateData.password) delete updateData.password; // prevent direct password change here
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password -otp");
  }

  /** Delete user */
  static async deleteUser(User, userId) {
    return await User.findByIdAndDelete(userId).select("-password -otp");
  }

  /** Count users per role */
  static async roleBreakdown(User) {
    const total = await User.countDocuments();
    const breakdown = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Convert to { role: count } format
    const breakDown = breakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    return { total, breakDown };
  }
}

module.exports = TenantUserService;
