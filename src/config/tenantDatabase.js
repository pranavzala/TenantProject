const mongoose = require('mongoose');

const connectToTenantDatabase = async (tenantName) => {
  const uri = `mongodb://localhost:27017/${tenantName}`;
  const tenantDb = await mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  return tenantDb; 
};

module.exports = connectToTenantDatabase; 
