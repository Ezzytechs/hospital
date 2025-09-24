const SubscriptionService = require("./subscription.service");

class SubscriptionController {
  // ---------- SUPER ADMIN ----------
  static async createPlan(req, res) {
    try {
      const plan = await SubscriptionService.createPlan(req.body);
      res.status(201).json(plan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updatePlan(req, res) {
    try {
      const plan = await SubscriptionService.updatePlan(
        req.params.id,
        req.body
      );
      if (!plan) return res.status(404).json({ error: "Plan not found" });
      res.json(plan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  static async getActiveSubscribers(req, res) {
    try {
      const activeSubscribers = await SubscriptionService.activeSubscribers();
      if (!activeSubscribers)
        return res
          .status(404)
          .json({ error: "Unable to list active subscribers" });
      res.status(200).json(activeSubscribers);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  static async getTotalActiveSubscribers(req, res) {
    try {
      const totalActiveSubscribers =
        await SubscriptionService.totalActiveSubscribers();
      if (!totalActiveSubscribers)
        return res
          .status(404)
          .json({ error: "Unable to get total active subscribers" });
      res.status(200).json({totalActiveSubscribers});
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deletePlan(req, res) {
    try {
      await SubscriptionService.deletePlan(req.params.id);
      res.json({ message: "Plan deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async listPlans(req, res) {
    try {
      const plans = await SubscriptionService.listPlans();
      res.json(plans);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // ---------- TENANT ADMIN ----------
  static async purchase(req, res) {
    try {
      const { _id: tenantId } = req.tenant;
      const { planId } = req.body;

      const sub = await SubscriptionService.purchase(tenantId, planId);
      res.status(201).json(sub);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async checkStatus(req, res) {
    try {
      const { _id: tenantId } = req.tenant;
      const status = await SubscriptionService.checkStatus(tenantId);
      res.json(status);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = SubscriptionController;
