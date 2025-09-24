const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true }, 
  features: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionSchema);
