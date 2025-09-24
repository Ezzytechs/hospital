const mongoose = require("mongoose");

function chatSchema() {
  return new mongoose.Schema(
    {
      type: {
        type: String,
        enum: ["private", "room"],
        required: true,
      },

      // 🔹 Sender of the message
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

      // 🔹 For private chats
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

      // 🔹 For room chats
      room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

      // 🔹 Message content (optional if it's just a file)
      message: { type: String },

      // 🔹 File support
      fileUrl: { type: String }, // single file for simplicity (can expand to array)
      fileType: {
        type: String,
        enum: ["image", "video", "audio", "document", "other"],
      },

      // 🔹 Message status
      status: {
        type: String,
        enum: ["new", "delivered", "seen"],
        default: "new",
      },

      // 🔹 Read receipts per user
      readBy: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          readAt: { type: Date, default: Date.now },
        },
      ],
    },
    { timestamps: true }
  );
}

module.exports = (conn) => conn.model("Chat", chatSchema());
