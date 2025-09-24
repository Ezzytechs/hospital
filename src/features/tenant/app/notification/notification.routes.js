const express = require("express");
const router = express.Router();
const NotificationController = require("./notification.controller");
const tenantAuth=require("../../middleware/tenantAuth")
// subscribe browser client
router.post("/subscribe", NotificationController.subscribe);

// trigger notification
router.post("/notify", tenantAuth, NotificationController.notify);
router.post("/notify-user", tenantAuth, NotificationController.notify);
router.post("/notify-users", tenantAuth, NotificationController.notify);

module.exports = router;
