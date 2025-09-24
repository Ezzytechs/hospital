const { Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function userSchema() {
  const s = new Schema({
    username: { type: String, required: true, trim: true, lowercase: true },
    fullName: { fName: String, lName: String },
    dob: Date,
    email: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    particulars: { type: Object, default: {} },
    role: {
      type: String,
      enum: ["tenant_admin", "doctor", "patient", "pharmacist", "nurse"],
      required: true,
    },
    password: { type: String, required: true },
    otp: {
      code: Number,
      expiresIn: Date,
    },
    createdAt: { type: Date, default: Date.now },
  });

  // 🔹 Hash password before saving
  s.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  // 🔹 Compare candidate password with hashed password
  s.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
  };

  // 🔹 Generate Access & Refresh Tokens
  s.methods.generateAuthTokens = function (subdomain) {
    console.log(subdomain);
    const user = this;
    const payload = {
      userId: user._id,
      username: user.username,
      subdomain,
      email: user.email,
      role: user.role,
    };
    const accessToken = jwt.sign(
      payload,
      process.env.TENANT_ACCESS_TOKEN,
      { expiresIn: "1d" } // short-lived access token
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.TENANT_REFRESH_TOKEN,
      { expiresIn: "7d" } // long-lived refresh token
    );

    return { accessToken, refreshToken };
  };

  // 🔹 Set Refresh Token into Secure Cookie
  s.methods.setRefreshToken = function (refreshToken, res) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // not accessible via JS
      secure: process.env.NODE_ENV === "production", // only https in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  };

  return s;
}

module.exports = (conn) => conn.model("User", userSchema());
