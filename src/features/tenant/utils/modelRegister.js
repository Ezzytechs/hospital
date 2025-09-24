const { getTenantConnection } = require("./connectionManager");
const User = require("../app/user/profile/user.model");
const Chat = require("../app/chat/chat.model");
const Notification = require("../app/notification/notification.model");
// const Appointment = require("../models/app/appointment/appointment.model");
const Room = require("../app/chat/room/room.model");

const models = { User, Room, Chat, Notification };

/** * Bind imported models to a tenant connection */
async function getTenantModels(dbUri) {
  const conn = await getTenantConnection(dbUri);
  const boundModels = {};

  for (const [name, modelFactory] of Object.entries(models)) {
    if (!conn.models[name]) {
      boundModels[name] = modelFactory(conn); // first time
    } else {
      boundModels[name] = conn.models[name]; // reuse cached
    }
  }

  console.log(`📦 Tenant models ready for [${conn.name}]:`, Object.keys(conn.models));
  return boundModels;
}

module.exports = { getTenantModels };
