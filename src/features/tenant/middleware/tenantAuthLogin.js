const { getTenantModels } = require("../utils/modelRegister");
const Tenant = require("../../super/app/tenant/tenant.model");

async function tenantAuthMiddleware(req, res, next) {
  try {
    const subdomain = req.body.subdomain; // or subdomain
    if (!subdomain)
      return res.status(400).json({ error: "Tenant subdomain is required" });

    const tenant = await Tenant.findOne({ subdomain });
    if (!tenant) return res.status(404).json({ error: "Hospital not found" });
    // Connect to tenant DB regardless of subscription
    const conn = await getTenantModels(
      process.env.MONGO_URI_TEMPLATE + tenant.dbName
    );

    req.db = conn; //attach models
    req.tenant = tenant; // attach hospital info for subscription endpoints

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tenant connection failed" });
  }
}

module.exports = tenantAuthMiddleware;
