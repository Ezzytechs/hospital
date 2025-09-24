const SubscriptionPlan = require("./subscription.model");
const TenantSubscription = require("./tenantSubscription.model");
const Tenant = require("../tenant/tenant.model");
class SubscriptionService {
  // SUPER ADMIN → create subscription plan
  static async createPlan(data) {
    return await SubscriptionPlan.create(data);
  }

  // SUPER ADMIN → update subscription plan
  static async updatePlan(planId, data) {
    return await SubscriptionPlan.findByIdAndUpdate(planId, data, {
      new: true,
    });
  }

  // SUPER ADMIN → delete subscription plan
  static async deletePlan(planId) {
    return await SubscriptionPlan.findByIdAndDelete(planId);
  }

  // SUPER ADMIN → get active subscribers
  static async activeSubscribers() {
    const activeSubscribers = await TenantSubscription.find().populate([
      { path: "tenant", select: "subdomain name" },
      { path: "plan", select: "price name durationDays" },
    ]);
    if (!activeSubscribers) throw new Error("Unable to get active subscribers");
    return activeSubscribers;
  }
  // SUPER ADMIN → get total active subscribers
  static async totalActiveSubscribers() {
    const totalActiveSubscribers = await TenantSubscription.countDocuments();
    if (typeof totalActiveSubscribers !== "number")
      throw new Error("Unable to get total active subscribers");
    return totalActiveSubscribers;
  }
  // SUPER ADMIN + Tenant ADMIN → list all plans
  static async listPlans() {
    return await SubscriptionPlan.find();
  }

  static async purchase(tenantId, planId) {
    await TenantSubscription.deleteMany({});
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new Error("Plan not found");
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error("Tenant with this id does not exist");
    const now = new Date();
    // check if active subscription exists
    let activeSub = await TenantSubscription.findOne({
      tenant: tenantId,
      expiresAt: { $gt: now },
    }).sort({ expiresAt: -1 });

    if (activeSub) {
      // extend expiry date
      activeSub.expiresAt = new Date(
        activeSub.expiresAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
      );
      await activeSub.save();
      return activeSub;
    } else {
      // create new subscription
      const expiresAt = new Date(
        now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
      );

      const subscription = await TenantSubscription.create({
        tenant: tenantId,
        dbUri: tenant.dbName,
        subdomain: tenant.subdomain,
        plan: planId,
        purchasedAt: now,
        expiresAt,
      });
      return subscription;
    }
  }

  // TenantL ADMIN → check subscription
  static async checkStatus(tenantId) {
    const sub = await TenantSubscription.findOne({ tenantId }).populate("plan");
    if (!sub) return { active: false };
    return {
      active: true,
      subscriptionInfo: {
        purchaseOn: sub.purchasedAt,
        expiresOn: sub.expiresAt,
      },
    };
  }
}

module.exports = SubscriptionService;
