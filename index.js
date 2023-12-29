const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerOptions');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const connectToTenantDatabase = require('./src/config/tenantDatabase');
const { errorMiddleware, handleNotFoundError } = require('./errorMiddleware');
const authenticateUser = require('./src/middleware/authMiddleware');
dotenv.config();


const app = express();
app.use(express.json());

const masterDBUri = process.env.MASTER_DB_LOCAL_URI;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(masterDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Master Database');


    const tenantMiddleware = async (req, res, next) => {
      try {
        const authenticatedUser = req.user;

        if (!authenticatedUser || !authenticatedUser.tenant || !authenticatedUser.tenant.tenant_name) {
          return res.status(400).json({ error: 'Tenant not provided in authenticated user' });
        }

        const tenantName = authenticatedUser.tenant.tenant_name;

        req.authenticatedUser = authenticatedUser;
        req.tenantDb = await connectToTenantDatabase(tenantName);
        req.masterDb = masterDBUri;
        next();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to connect to tenant database', details: error.message });
      }
    };

    const middlewareFunctions = [authenticateUser, tenantMiddleware];
    app.use('/product', ...middlewareFunctions, productRoutes);

    app.use('/auth', authRoutes);

    app.use(errorMiddleware);
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use((req, res) => {
      handleNotFoundError(res, 'Resource');
    });
  } catch (error) {
    console.error('Master Database connection error:', error);
    throw error;
  }
};

const startServer = async () => {
  await connectToDatabase();
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Closing server.');
    server.close(() => {
      console.log('Server closed. Exiting process.');
      process.exit(0);
    });
  });
};

startServer().catch(error => console.error(error));
