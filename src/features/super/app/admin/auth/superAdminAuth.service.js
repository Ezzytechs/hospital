const SuperAdmin = require("../profile/superAdmin.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")
class SuperAdminAuthService {
  /** Signup */
  static async signup(data, res) {
    const existing = await SuperAdmin.findOne({ email: data.email });
    if (existing) throw new Error("Super admin with this email already exists");

    const admin = new SuperAdmin(data);
    const savedAdmin = await admin.save();
    const { accessToken, refreshToken } = admin.generateAuthTokens();
    admin.setRefreshToken(res, refreshToken);
    return { savedAdmin, accessToken };
  }

  /** Signin */
  static async signin(data, res) {
    const { email, password } = data;
    const admin = await SuperAdmin.findOne({ email }).select("-otp -__v");
    if (!admin) throw new Error("Invalid credentials");

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");

    const { accessToken, refreshToken } = admin.generateAuthTokens();
    admin.setRefreshToken(res, refreshToken);
    const obj = admin.toObject();
    delete obj.password;
    return { admin: { ...obj }, accessToken };
  }

  /** Generate OTP for password reset */
  static async generateOtp(email) {
    const admin = await SuperAdmin.findOne({ email });
    if (!admin) throw new Error("Email not found");

    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 mins
    admin.otp = { code: otp, expires };
    await admin.save();

    return otp; // normally send via email/SMS
  }

  /** Reset password with OTP */
  static async resetPassword({ email, otp, newPassword }) {
    const admin = await SuperAdmin.findOne({ email });
    if (!admin) throw new Error("Email not found");

    if (!admin.otp || admin.otp.code !== otp) throw new Error("Invalid OTP");

    if (Date.now() > admin.resetOtpExpires) throw new Error("OTP has expired");

    admin.password = newPassword;
    admin.otp = {
      code: null,
      expires: null,
    };
    await admin.save();

    return true;
  }

  /** Update password when logged in */
  static async updatePassword({ adminId, oldPassword, newPassword }) {
    const admin = await SuperAdmin.findById(adminId);
    if (!admin) throw new Error("Super admin not found");

    const isMatch = await admin.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Old password is incorrect");

    admin.password = newPassword;
    await admin.save();

    return true;
  }

  /** Change email */
  static async changeEmail({ adminId, newEmail }) {
    const existing = await SuperAdmin.findOne({ email: newEmail });
    if (existing) throw new Error("Email already taken");

    const admin = await SuperAdmin.findById(adminId);
    if (!admin) throw new Error("Super admin not found");

    admin.email = newEmail;
    await admin.save();

    return admin;
  }
  static async refreshToken(refreshToken, res) {
    
    if (!refreshToken) throw new Error("No refresh token provided");

    // 🔹 Verify refresh token
    let decoded;
      decoded =jwt.verify(refreshToken, process.env.SUPERADMIN_REFRESH_TOKEN);

    // 🔹 Find SuperAdmin
    const superAdmin = await SuperAdmin.findById(decoded.adminId).select(
      "-password -otp -__v"
    );
    if (!superAdmin) throw new Error("SuperAdmin not found");

    // 🔹 Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      superAdmin.generateAuthTokens();
      superAdmin.setRefreshToken(res, newRefreshToken);   
    return { accessToken };
  }
}

module.exports = SuperAdminAuthService;
