const mongoose = require('mongoose');
require('dotenv').config();

const { MASTER_DB_LOCAL_URI } = process.env;

mongoose.connect(MASTER_DB_LOCAL_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const masterDb = mongoose.connection;

masterDb.on('error', console.error.bind(console, 'Master Database connection error:'));
masterDb.once('open', () => {
  // console.log('Connected to Master Database');
});

module.exports = masterDb;
