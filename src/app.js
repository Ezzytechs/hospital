const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(express.json());

app.use(morgan("dev")); // "dev" is a predefined format

const API_VERSION = "/api/v1";

// mount superadmin routes under /superadmin
const superAdminAuthRoutes = require("./features/super/app/admin/auth/superAdminAuth.routes");
const superAdminRoutes = require("./features/super/app/admin/profile/superAdmin.routes");
const subscriptionRoutes = require("./features/super/app/subscription/subscription.routes");
const tenantRoutes = require("./features/super/app/tenant/tenant.routes")

app.use(`${API_VERSION}/superadmin/auth`, superAdminAuthRoutes);
app.use(`${API_VERSION}/superadmin/profile`, superAdminRoutes);
app.use(`${API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`${API_VERSION}/tenants`, tenantRoutes);

//tenant routes
const tenantUserAuthRoutes = require("./features/tenant/app/user/auth/userAuth.routes")
const tenantUserRoutes = require("./features/tenant/app/user/profile/user.routes")
const tenantChatRoomRoutes = require("./features/tenant/app/chat/room/room.routes")
const tenantChatRoutes = require("./features/tenant/app/chat/chat.routes")
const tenantFileRoutes = require("./features/tenant/app/file/file.routes")
const tenantNotificationRoutes = require("./features/tenant/app/notification/notification.routes")

app.use(`${API_VERSION}/tenant/files`, tenantFileRoutes);
app.use(`${API_VERSION}/tenant/user/auth`, tenantUserAuthRoutes);
app.use(`${API_VERSION}/tenant/user`, tenantUserRoutes);
app.use(`${API_VERSION}/tenant/chats`, tenantChatRoutes);
app.use(`${API_VERSION}/tenant/chat-rooms`, tenantChatRoomRoutes);
app.use(`${API_VERSION}/tenant/notifications`, tenantNotificationRoutes);


// health
app.get("/health", (req, res) => res.json({ ok: true }));
// fallback error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
