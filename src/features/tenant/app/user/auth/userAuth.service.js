const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class TenantUserAuthService {
  static async login(User, email, password, subdomain, res) {
    // console.log(await User.findOne({email:"initiator90@mail.com"}))
    const user = await User.findOne({ email });

    if (!user) throw new Error("Invalid user credentials");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");

    const { accessToken, refreshToken } = user.generateAuthTokens(subdomain);
    user.setRefreshToken(refreshToken, res);

    return { user, accessToken };
  }

  static async addUser(User, userData) {
    const newUser = await User.create(userData);
    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.otp;
    return userObj;
  }

  static async generateOtp(User, email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresIn = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otp = { code, expiresIn };
    await user.save();

    // ⚠️ Send OTP via email or SMS (stub here)
    return code;
  }

  static async resetPassword(User, email, otp, newPassword) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    if (user.otp.code !== Number(otp) || Date.now() > user.otp.expiresIn) {
      throw new Error("Invalid or expired OTP");
    }

    user.password = newPassword;
    user.otp = {
      code: 0,
      expiresIn: null,
    };
    await user.save();
  }

  static async updatePassword(User, currentUser, oldPassword, newPassword) {
    const user = await User.findById(currentUser.userId);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    user.password = newPassword;
    await user.save();
  }

  static async changeEmail(User, currentUser, newEmail) {
    const user = await User.findById(currentUser.userId);
    if (!user) throw new Error("User not found");

    user.email = newEmail;
    await user.save();
  }
}

module.exports = TenantUserAuthService;
