const mongoose = require("mongoose");

class ChatService {
  constructor(ChatModel) {
    this.Chat = ChatModel;
  }

  /**
   * Get chat history between two users
   */
  async getPrivateChatHistory(userId, friendId, limit = 50, skip = 0) {
    return this.Chat.find({
      type: "private",
      participants: { $all: [userId, friendId] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "_id username email")
      .lean()
      .exec();
  }

  /**
   * Get list of friends the user has chatted with + last message
   */
  async getChatFriends(userId) {
    const pipeline = [
      { $match: { type: "private", participants: mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: [{ $arrayElemAt: ["$participants", 0] }, mongoose.Types.ObjectId(userId)] },
              { $arrayElemAt: ["$participants", 1] },
              { $arrayElemAt: ["$participants", 0] },
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "friend",
        },
      },
      { $unwind: "$friend" },
      {
        $project: {
          friend: { _id: 1, username: 1, email: 1, isOnline: 1 },
          lastMessage: {
            _id: 1,
            message: 1,
            fileUrl: 1,
            status: 1,
            createdAt: 1,
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ];

    return this.Chat.aggregate(pipeline).exec();
  }
}

module.exports = ChatService;
