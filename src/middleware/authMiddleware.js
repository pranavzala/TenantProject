const jwt = require('jsonwebtoken');
const MasterUser = require('../models/MasterUser');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await MasterUser.findOne({ _id: decoded._id}).populate('tenant');

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user; // Add the authenticated user to the request object
    next();
  } catch (error) {
    console.log("error",error)
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authenticateUser;
