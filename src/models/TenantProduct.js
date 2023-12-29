const mongoose = require('mongoose');

const tenantProductSchema = new mongoose.Schema({
  product_name: { type: String, unique: true, required: true },
  product_price: { type: Number, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterUser' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterUser' },
});

const TenantProduct = mongoose.model('TenantProduct', tenantProductSchema);

module.exports = TenantProduct;
