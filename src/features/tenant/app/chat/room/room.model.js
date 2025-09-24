const mongoose = require("mongoose");

function roomSchema() {
  return new mongoose.Schema(
    {
      name: { type: String, required: true, unique:[true, "Room with this name already exist"] }, // e.g. "Support Group", "Dev Chat"
      description: { type: String },

      // users inside this room
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

      // who created the room
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

      // optional settings
      isPrivate: { type: Boolean, default: false }, // if true, only invited members can join
      avatar: { type: String }, // optional group icon

    },
    { timestamps: true }
  );
}

module.exports = (conn) => conn.model("Room", roomSchema());
