const { v4: uuidv4 } = require("uuid");
const Tenant = require("../app/tenant/tenant.model");
const { getTenantModels } = require("../../tenant/utils/modelRegister");

async function provisionTenant({
  name,
  subdomain,
  createdBy,
  adminUsername,
  adminEmail,
  adminName,
}) {

  const dbName = `tenant_${uuidv4()}`;
  // create metadata in central DB
  const meta = new Tenant({
    name,
    subdomain,
    dbName,
    status: "provisioning",
    createdBy,
  });

  await meta.save();

  try {
   const templateUri = process.env.MONGO_URI_TEMPLATE;
    const mongoUri = templateUri.replace(
      "{DB_NAME}",
      subscription.tenant.dbName
    );

    // 2) get User model from registry
    const { User } = await getTenantModels(mongoUri);

    // 3) create admin user with random password
    const adminPassword = "default";
    const adminUser = new User({
      username:adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: "tenant_admin",
      profile: { fullName: adminName },
    });
    await adminUser.save();

    // 4) create indexes
    await User.createIndexes();

    // 5) update meta status
    meta.status = "active";
    await meta.save();

    return {
      tenantId:meta._id,
      tenantSubdomain:meta.subdomain,
      tenantName:meta.name,
      adminEmail: adminUser.email,
    };
  } catch (err) {
    console.error("Provisioning failed", err);
    throw err;
  }
}

module.exports = { provisionTenant };
