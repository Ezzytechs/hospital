const http = require("http");
const { Server } = require("socket.io");
const { PORT, CENTRAL_MONGO_URI } = require("./config/env");
const app = require("./app");
const connectCentralDb = require("./config/db/centralDb");
const registerSocket = require("./features/tenant/app/chat/chat"); 

(async () => {
  try {
    // 1. Connect to central DB
    await connectCentralDb(CENTRAL_MONGO_URI);

    // 2. Create HTTP server
    const server = http.createServer(app);

    // 3. Setup Socket.IO
    const io = new Server(server, {
      cors: {
        origin: "*", // or restrict to your frontend domain
        methods: ["GET", "POST"],
      },
    });

    // 4. Register socket events
    registerSocket(io);

    // 5. Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
