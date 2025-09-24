const TenantService = require("./tenant.service");

class TenantController {
  static async createTenant(req, res) {
    try {
      const { name, subdomain, adminEmail, adminUsername, adminName } =
        req.body;
      const result = await TenantService.createTenant({
        name,
        subdomain,
        adminEmail,
        adminName,
        adminUsername,
        superAdminId: req.superAdmin.adminId,
      });

      res.status(201).json({
        message: "Tenant provisioned",
        ...result,
      });
    } catch (err) {
      console.error("createTenant error", err);
      res.status(err.statusCode || 500).json({
        message: err.statusCode === 409 ? err.message : "Provisioning failed",
        error: err.message,
      });
    }
  }

  static async getAllTenants(req, res) {
    try {
      const tenants = await TenantService.getAllTenants();
      res.json(tenants);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getTotalTenants(req, res) {
    try {
      const totalTenants = await TenantService.getTotalTenants();
      res.json(totalTenants);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  static async getTenantById(req, res) {
    try {
      const tenant = await TenantService.getTenantById(req.params.id);
      res.json(tenant);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  static async updateTenant(req, res) {
    try {
      const tenant = await TenantService.updateTenant(req.params.id, req.body);
      res.json({ message: "Tenant updated successfully", tenant });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deleteTenant(req, res) {
    try {
      await TenantService.deleteTenant(req.params.id);
      res.json({ message: "Tenant deleted successfully" });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
}

module.exports = TenantController;
