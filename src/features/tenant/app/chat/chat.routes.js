const express = require("express");
const ChatController = require("./chat.controller");
const tenantAuth = require("../../middleware/tenantAuth"); // JWT middleware
const router = express.Router();
const chatController = new ChatController();

// Private chat history
router.get("/:friendId", tenantAuth, chatController.getPrivateChatHistory);

// List of friends with last messages
router.get("/friends/list", tenantAuth, chatController.getChatFriends);

module.exports = router;
