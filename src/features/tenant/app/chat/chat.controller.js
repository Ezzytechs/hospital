const ChatService = require("./chat.service");

class ChatController {
  constructor() {}

  // GET /chats/:friendId
  getPrivateChatHistory = async (req, res) => {
    try {
      const { friendId } = req.params;
      const userId = req.user._id;
      const { limit = 50, skip = 0 } = req.query;

      const chatService = new ChatService(req.db.Chat);

      const chats = await chatService.getPrivateChatHistory(
        userId,
        friendId,
        parseInt(limit),
        parseInt(skip)
      );

      return res.json({ ok: true, chats });
    } catch (err) {
      console.error("getPrivateChatHistory error:", err);
      res.status(500).json({ ok: false, error: "Failed to fetch chat history" });
    }
  };

  // GET /chats/friends/list
  getChatFriends = async (req, res) => {
    try {
      const userId = req.user._id;
      const chatService = new ChatService(req.db.Chat);

      const friends = await chatService.getChatFriends(userId);
      return res.json({ ok: true, friends });
    } catch (err) {
      console.error("getChatFriends error:", err);
      res.status(500).json({ ok: false, error: "Failed to fetch chat friends" });
    }
  };
}

module.exports = ChatController;
