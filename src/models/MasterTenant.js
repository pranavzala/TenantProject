const mongoose = require('mongoose');

const masterTenantSchema = new mongoose.Schema({
  tenant_name: { type: String, unique: true, required: true },
});

const MasterTenant = mongoose.model('MasterTenant', masterTenantSchema);

module.exports = MasterTenant;
