const mongoose = require("mongoose");

const tenantSubscriptionSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true,
  },
  dbName: String,
  subdomain: String,
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// TTL index → auto deletes subscription when expiresAt is reached
tenantSubscriptionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TenantSubscription", tenantSubscriptionSchema);
