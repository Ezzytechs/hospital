const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SuperAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  username: {
    type: String,
    unique: [true, "super admin with this username already exist"],
  },
  password: { type: String, required: true, },
  otp: {
    code: Number,
    expires: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

// 🔐 Hash password on save
SuperAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password
SuperAdminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// 🔑 Generate JWT tokens (access + refresh)
SuperAdminSchema.methods.generateAuthTokens = function () {
  const admin = this;
  const payload = {
    adminId: admin._id,
    username: admin.username,
    role: "super_admin",
  };
  const accessToken = jwt.sign(
    payload,
    process.env.SUPERADMIN_ACCESS_TOKEN,
    { expiresIn: "1d" } // ⏳ short-lived
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.SUPERADMIN_REFRESH_TOKEN,
    { expiresIn: "7d" } // 🔄 longer-lived
  );
  return { accessToken, refreshToken };
};

// 🍪 Set refresh token as HTTP-only cookie
SuperAdminSchema.methods.setRefreshToken = function (res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // use HTTPS in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = mongoose.model("SuperAdmin", SuperAdminSchema);
