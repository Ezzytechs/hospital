const mongoose = require("mongoose");

// global cache (works across serverless warm starts + long-running servers)
let cached = global.__connections__;
if (!cached) {
  cached = global.__connections__ = {};
  // { [dbUri]: { conn: mongoose.Connection, lastUsed: number } }
}

/**
 * Get or create a tenant connection
 */
async function getTenantConnection(dbUri) {
  if (!dbUri) throw new Error("dbUri required");

  // reuse existing connection if alive
  if (cached[dbUri]?.conn?.readyState === 1) {
    cached[dbUri].lastUsed = Date.now();
    return cached[dbUri].conn;
  }

  // otherwise create new connection
  const conn = await mongoose.createConnection(dbUri, {
    maxIdleTimeMS: 5 * 60 * 1000, // let MongoDB driver close idle sockets after 5 min
  });

  cached[dbUri] = { conn, lastUsed: Date.now() };
  return conn;
}

/**
 * Cleanup job: closes connections idle > 5 min
 * (useful in long-running environments; harmless in serverless)
 */
setInterval(() => {
  const now = Date.now();
  for (const [uri, { conn, lastUsed }] of Object.entries(cached)) {
    if (conn.readyState === 1 && now - lastUsed > 5 * 60 * 1000) {
      console.log(`⏳ Closing idle tenant connection: ${uri}`);
      conn.close();
      delete cached[uri];
    }
  }
}, 60 * 1000);

module.exports = { getTenantConnection };
