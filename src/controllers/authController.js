const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const MasterUser = require('../models/MasterUser');
const MasterTenant = require('../models/MasterTenant');

const registerUser = async (req, res) => {

  
  try {
    const { email, password, tenant_name } = req.body;

    if (!email || !password || !tenant_name) {
      return res.status(400).json({ error: 'Email, Password, and Tenant Name are required.' });
    }

    // Check if tenant_name contains spaces
    if (/\s/.test(tenant_name)) {
      return res.status(400).json({
        error: 'Invalid Tenant Name: It should not contain spaces. Use only alphanumeric characters, and consider camelCase or underscores for multi-word names.',
        example: {
          email: 'cloudGate@gmail.com',
          password: 'Admin',
          tenant_name: 'validTenantName',
          tenant_name1: 'valid_Tenant_Name',
          tenant_name2: 'valid-Tenant-Name',
          tenant_name3: 'valid_Tenant-Name',
        }
      });
    }

    const existingUser = await MasterUser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    let tenant = await MasterTenant.findOne({ tenant_name });

    if (!tenant) {
      tenant = new MasterTenant({ tenant_name });
      await tenant.save();
    } else {
      return res.status(400).json({ error: 'Tenant with this name already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new MasterUser({ email, password: hashedPassword, tenant: tenant._id });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and Password are required.' });
    }

    const user = await MasterUser
      .findOne({ email })
      .populate({
        path: 'tenant',
        select: '_id tenant_name'
      })
      .select('_id email password tenant');

    if (!user) {
      return res.status(401).json({ error: 'User not found with this email address.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Incorrect Password.' });
    }

    if (!user.tenant) {
      return res.status(401).json({ error: 'User is not associated with any tenant.' });
    }

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    res.json({ token, user });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
};

module.exports = { registerUser, loginUser };
