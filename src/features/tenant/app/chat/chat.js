const jwt = require("jsonwebtoken");
const TenantSubscription = require("../../../super/app/subscription/tenantSubscription.model");
const { getTenantModels } = require("../../utils/modelRegister");

const SECRET = process.env.TENANT_ACCESS_TOKEN;

module.exports = function registerSocket(io) {
  let User = null;
  let Chat = null;
  let Room = null;

  // 🔹 Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication error: no token"));

      const decoded = jwt.verify(token, SECRET);
      const userId = decoded?.userId;
      if (!userId)
        return next(new Error("Authentication error: invalid token"));

      const tenantSubscription = await TenantSubscription.findOne({
        subdomain: decoded.subdomain,
      }).populate("tenant", "dbName");

      ({ User, Chat, Room } = await getTenantModels(
        process.env.MONGO_URI_TEMPLATE + tenantSubscription.tenant.dbName
      ));

      const user = await User.findById(userId)
        .lean()
        .select("_id username email")
        .exec();

      if (!user) return next(new Error("Authentication error: user not found"));

      // ✅ attach to socket
      socket.data.currentUser = {
        userId: String(user._id),
        username: user.username || user.email || "Unknown",
      };

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, username } = socket.data.currentUser;
    const personalRoom = `user:${userId}`;
    console.log("✅ Connected:", username, userId);

    socket.join(personalRoom);

    // 🔹 Mark user online
    (async () => {
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true }).exec();
        socket.broadcast.emit("userOnline", { userId, username });
      } catch (err) {
        console.error("Error setting user online:", err);
      }
    })();

    // ---------------------
    // privateMessage
    // ---------------------
    socket.on("privateMessage", async (payload, ack) => {
      try {
        const { to, message, fileUrl } = payload;
        if (!to || (!message && !fileUrl)) {
          return ack?.({ ok: false, error: "Missing 'to' or message/file" });
        }

        const user = await User.findById(to);
        if (!user) throw new Error("Provide valid user id");

        const chat = await Chat.create({
          type: "private",
          participants: [userId, to],
          sender: userId,
          message,
          fileUrl,
        });

        io.to(`user:${to}`).emit("privateMessage", chat);
        socket.emit("privateMessage", chat);

        ack?.({ ok: true, chatId: chat._id });
      } catch (err) {
        console.error("privateMessage error:", err);
        ack?.({ ok: false, error: "Failed to send private message" });
      }
    });

    // ---------------------
    // roomMessage
    // ---------------------
    socket.on("roomMessage", async (payload, ack) => {
      try {
        const { room, message, fileUrl } = payload;
        if (!room || (!message && !fileUrl)) {
          return ack?.({ ok: false, error: "Missing 'room' or message/file" });
        }

        const chat = await Chat.create({
          type: "room",
          room,
          sender: userId,
          message,
          fileUrl,
        });

        io.to(room).emit("roomMessage", chat);
        ack?.({ ok: true, chatId: chat._id });
      } catch (err) {
        console.error("roomMessage error:", err);
        ack?.({ ok: false, error: "Failed to send room message" });
      }
    });

    // ---------------------
    // typing indicator
    // ---------------------
    socket.on("typing", (payload) => {
      try {
        const { to, isTyping = false, targetType = "user" } = payload || {};
        if (!to) return;

        if (targetType === "room") {
          io.to(to).emit("typing", { from: userId, isTyping });
        } else {
          io.to(`user:${to}`).emit("typing", { from: userId, isTyping });
        }
      } catch (err) {
        console.error("typing error:", err);
      }
    });

    // ---------------------
    // readMessage
    // ---------------------
    socket.on("readMessage", async (chatId, ack) => {
      try {
        if (!chatId) return ack?.({ ok: false, error: "Missing chatId" });

        const chat = await Chat.findByIdAndUpdate(
          chatId,
          { read: true },
          { new: true }
        ).exec();

        if (!chat) return ack?.({ ok: false, error: "Chat not found" });

        const recipients = (chat.participants || []).filter(
          (p) => String(p) !== userId
        );

        recipients.forEach((r) =>
          io.to(`user:${r}`).emit("messageRead", { chatId, by: userId })
        );

        ack?.({ ok: true });
      } catch (err) {
        console.error("readMessage error:", err);
        ack?.({ ok: false, error: "Failed to mark message read" });
      }
    });

    // ---------------------
    // joinRoom
    // ---------------------
    socket.on("joinRoom", async (roomId, ack) => {
      try {
        if (!roomId) {
          return ack?.({ ok: false, error: "Missing roomId" });
        }

        const room = await Room.findById(roomId).select("members name");
        if (!room) {
          return ack?.({ ok: false, error: "Room not found" });
        }

        // Check if user is in the room's members
        const isMember = room.members.some(
          (memberId) => memberId.toString() === userId.toString()
        );
        const commonName = ["common", "general", "public"];
        if (!isMember && !commonName.includes(room.name)) {
          return ack?.({
            ok: false,
            error: "You are not a member of this room",
          });
        }

        socket.join(roomId);
        ack?.({ ok: true, message: "Joined room successfully" });

        // Notify other members
        socket.to(roomId).emit("userJoined", { userId, roomId });
      } catch (err) {
        console.error("joinRoom error:", err);
        ack?.({ ok: false, error: "Failed to join room" });
      }
    });

    // ---------------------
    // disconnect
    // ---------------------
    socket.on("disconnect", async (reason) => {
      console.log("❌ Disconnected:", username, reason);
      try {
        await User.findByIdAndUpdate(userId, { isOnline: false }).exec();
        socket.broadcast.emit("userOffline", { userId, username });
      } catch (err) {
        console.error("Error setting user offline:", err);
      }
    });
  });
};
