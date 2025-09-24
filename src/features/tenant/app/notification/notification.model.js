const mongoose = require("mongoose");

function notificationSchema() {
  return new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

      // 🔹 Browser endpoint for push service
      endpoint: { type: String, required: true, unique: true },

      // 🔹 Keys required for encryption
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
    { timestamps: true }
  );
}

module.exports = (conn) => conn.model("Notification", notificationSchema());
