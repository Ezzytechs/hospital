const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class NotificationService {
  /** Save a notfication to DB */
  static async addnotfication(notfication, userId, Notfication) {
    try {
      const exists = await Notfication.findOne({ endpoint: notfication.endpoint });
      if (!exists) {
        await Notfication.create({ ...notfication, userId });
      }
      return { success: true, message: "notfication saved" };
    } catch (err) {
      console.error("❌ Error saving notfication:", err);
      throw err;
    }
  }

  /** Read all notfications from DB */
  static async getnotfications(filter = {}) {
    return Notfication.find(filter).lean();
  }

  /** Send notification to all subscribers */
  static async sendNotification(payload, filter, Notfication) {
    const subs = await Notfication.find(filter);

    // Instead of blocking loop, run in background
    setImmediate(async () => {
      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (err) {
          // notfication expired → remove from DB
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.warn("⚠️ Removing expired notfication:", sub.endpoint);
            await Notfication.deleteOne({ _id: sub._id });
          } else {
            console.error("❌ Push error:", err);
          }
        }
      }

    });

    return { success: true, count: subs.length };
  }
    /** 🔹 Send to a specific user by userId */
  static async sendToUser(userId, payload, NotificationModel) {
    return this.sendNotification(payload, { userId }, NotificationModel);
  }
  
    /** 🔹 Send to multiple users */
  static async sendToUsers(userIds = [], payload, NotificationModel) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("userIds must be a non-empty array");
    }

    return this.sendNotification(
      payload,
      { userId: { $in: userIds } }, // MongoDB filter
      NotificationModel
    );
  }
}

module.exports = NotificationService;
