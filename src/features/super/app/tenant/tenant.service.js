const mongoose = require("mongoose");
const Tenant = require("./tenant.model");
const { provisionTenant } = require("../../utils/createTenant");

class TenantService {
  static async createTenant({
    name,
    subdomain,
    adminEmail,
    adminUsername,
    adminName,
    superAdminId,
  }) {
    if (!name || !subdomain || !adminEmail || !adminName) {
      throw new Error("name, subdomain, adminEmail, adminName are required");
    }
    // check duplicate subdomain
    const exists = await Tenant.findOne({ subdomain });
    if (exists) {
      const err = new Error("Subdomain already taken");
      err.statusCode = 409;
      throw err;
    }

    // provision tenant (creates tenant DB + default admin)
    const {tenantId, tenantSubdomain, tenantName, adminEmail:adminMail } = await provisionTenant({
      name,
      subdomain,
      createdBy: superAdminId,
      adminUsername,
      adminEmail,
      adminName,
    });

    return {
      tenantId,
      tenantSubdomain,
      tenantName,
      adminEmail:adminMail,
    };
  }

  // READ all tenants
  static async getAllTenants() {
    return await Tenant.find()
      .select("-dbName -__v")
      .populate("createdBy", "username email");
  }

  // READ single tenant
  static async getTenantById(tenantId) {
    const tenant = await Tenant.findById(tenantId)
      .select("-dbName -__v")
      .populate("createdBy", "username email");
    if (!tenant) throw new Error("Tenant not found");
    return tenant;
  }
  //GET total tenants
  static async getTotalTenants() {
    const tenant = await Tenant.countDocuments();
    if (typeof tenant !== "number") throw new Error("Tenant not found");
    return tenant;
  }

  // UPDATE tenant
  static async updateTenant(tenantId, data) {
    const tenant = await Tenant.findByIdAndUpdate(tenantId, data, {
      new: true,
    }).select("-dbName -__v");
    if (!tenant) throw new Error("Tenant not found");
    return tenant;
  }

  // 🗑️ Delete tenant + tenant database
  static async deleteTenant(tenantId) {
    const tenant = await Tenant.findByIdAndDelete(tenantId);
    if (!tenant) throw new Error("Tenant not found");

    try {
      // 🔹 Tenant DB name
      const dbName = tenant.dbName; // e.g. tenant_ten_xxxxx

      // 🔹 Build DB URI
      const dbUri = `mongodb://localhost:27017/${dbName}`;

      // 🔹 Connect to the tenant DB
      const conn = await mongoose.createConnection(dbUri).asPromise();

      // 🔹 Drop the tenant database
      await conn.dropDatabase();
      await conn.close();

      console.log(`✅ Tenant DB '${dbName}' dropped successfully`);
    } catch (err) {
      console.error("❌ Error dropping tenant DB:", err.message);
      throw new Error("Tenant profile deleted but failed to drop tenant DB");
    }

    return true;
  }
}

module.exports = TenantService;
