const NotificationService = require("./notification.service");

class NotificationController {
  /** Subscribe client */
  static subscribe(req, res) {
    try {
      const notfication = req.body;
      const { Notification } = req.db;
      const { userId } = req.user;
      NotificationService.addSubscription(notfication, userId, Notification);
      res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
      console.error("❌ Subscription error:", err);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  }

  /** Trigger notification */
  static async notify(req, res) {
    try {
      const { Notification } = req.db;
      const filter = req.query || {};
      await NotificationService.sendNotification(
        req.body,
        filter,
        Notification
      );
      res.json({ success: true, message: "Notifications sent" });
    } catch (err) {
      console.error("❌ Notification error:", err);
      res.status(500).json({ error: err.message });
    }
  }
  /** Trigger notification */
  static async notifyUser(req, res) {
    try {
      const { Notification } = req.db;
      const filter = req.query || {};
      await NotificationService.sendToUser(
        filter,
        req.body,
        Notification
      );
      res.json({ success: true, message: "Notifications sent" });
    } catch (err) {
      console.error("❌ Notification error:", err);
      res.status(500).json({ error: err.message });
    }
  }
  /** Trigger notification */
  static async notifyUsers(req, res) {
    try {
      const { Notification } = req.db;
      const filter = req.query || {};
      await NotificationService.sendToUsers(
        req.body,
        filter,
        Notification
      );
      res.json({ success: true, message: "Notifications sent" });
    } catch (err) {
      console.error("❌ Notification error:", err);
      res.status(500).json({ error: err.message });
    }
  }

}

module.exports = NotificationController;
