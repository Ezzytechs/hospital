const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, unique: true, required: true },
  dbName: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
  status: { type: String, enum: ['provisioning', 'active', 'failed'], default: 'provisioning' }
}, { timestamps: true });

// ✅ Prevent OverwriteModelError
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
