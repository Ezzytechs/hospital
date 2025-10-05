const jwt = require("jsonwebtoken");
const { getTenantModels } = require("../utils/modelRegister");
const TenantSubscription = require("../../super/app/subscription/tenantSubscription.model");

async function tenantAuth(req, res, next) {
  try {
    // 🔹 Get token from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 🔹 Verify & decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TENANT_ACCESS_TOKEN);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    // 🔹 Extract subdomain from decoded payload
    const { subdomain } = decoded;
    if (!subdomain) {
      return res.status(400).json({ error: "Subdomain missing in token" });
    }

    // 🔹 Look for active subscription
    const now = new Date();
    const subscription = await TenantSubscription.findOne({
      subdomain,
      expiresAt: { $gt: now },
    })
      .sort({ expiresAt: -1 })
      .populate("tenant");
    if (!subscription) {
      return res.status(403).json({
        error: "Subscription expired. Please renew to access tenant data.",
      });
    }

    const templateUri = process.env.MONGO_URI_TEMPLATE;
    const mongoUri = templateUri.replace(
      "{DB_NAME}",
      subscription.tenant.dbName
    );

    // ✅ Subscription active → load tenant models
    const conn = await getTenantModels(mongoUri);

    req.db = conn;
    req.tenant = {
      tenantId: subscription.tenant?._id,
      dbName: subscription.dbName || subscription.tenant?.dbName,
      name: subscription.tenant?.name,
    };

    next();
  } catch (err) {
    console.error("Tenant middleware error:", err);
    res.status(500).json({ error: "Tenant resolution failed" });
  }
}

module.exports = tenantAuth;
