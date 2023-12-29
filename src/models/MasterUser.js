const mongoose = require('mongoose');

const masterUserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterTenant',
  },
});

const MasterUser = mongoose.model('MasterUser', masterUserSchema);

module.exports = MasterUser;
