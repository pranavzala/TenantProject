const TenantProduct = require('../models/TenantProduct');
const MasterUser = require('../models/MasterUser');
const MasterTenant = require('../models/MasterTenant');
const mongoose = require('mongoose');


exports.createProduct = async (req, res) => {
  try {
    const { product_name, product_price } = req.body;
    const createdBy = req.authenticatedUser._id;
    const Product = req.tenantDb.model('TenantProduct', TenantProduct.schema);

    if (!product_name || !product_price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const product = new Product({ product_name, product_price, created_by: createdBy });
    await product.save();

    res.status(201).json({ message: 'Product created successfully'});
  } catch (error) {
    console.error('error', error);

    if (error.code === 11000) {
      res.status(400).json({ error: 'Product with the same name already exists.' });
    } else if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ error: 'Validation error', validationErrors });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

exports.listProducts = async (req, res) => {
  try {
    const { page_no } = req.query;

    if (isNaN(page_no) || page_no < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    const pageSize = 10;
    const skip = (page_no - 1) * pageSize;

    const Product = req.tenantDb.model('TenantProduct', TenantProduct.schema);

    const products = await Product.find()
      .populate({
        path: 'created_by',
        model: MasterUser,
        select: 'email _id',
        populate: {
          path: 'tenant',
          model: MasterTenant,
          select: 'tenant_name _id',
        },
      })
      .populate({
        path: 'updated_by',
        model: MasterUser,
        select: 'email _id',
        populate: {
          path: 'tenant',
          model: MasterTenant,
          select: 'tenant_name _id',
        },
      })
      .select('product_name product_price created_by updated_by _id')
      .skip(skip)
      .limit(pageSize);

    res.json({
      products,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.viewProduct = async (req, res) => {
  try {
    const { _id } = req.query;

    if (!_id) {
      return res.status(400).json({ error: '_id parameter is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'Invalid _id format' });
    }

    const Product = req.tenantDb.model('TenantProduct', TenantProduct.schema);

    const product = await Product.findById(_id)
      .populate({
        path: 'created_by',
        model: MasterUser,
        select: 'email _id',
        populate: {
          path: 'tenant',
          model: MasterTenant,
          select: 'tenant_name _id',
        },
      })
      .populate({
        path: 'updated_by',
        model: MasterUser,
        select: 'email _id',
        populate: {
          path: 'tenant',
          model: MasterTenant,
          select: 'tenant_name _id',
        },
      })
      .select('product_name product_price created_by updated_by _id');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { _id, product_name, product_price } = req.body;
    const updatedBy = req.authenticatedUser._id;

    if (!_id || !product_name || !product_price) {
      return res.status(400).json({ error: 'Missing required fields. Please provide _id, productName, and productPrice.' });
    }

    const Product = req.tenantDb.model('TenantProduct', TenantProduct.schema);

    const existingProduct = await Product.findOne({ product_name, _id: { $ne: _id } });

    if (existingProduct) {
      return res.status(400).json({ error: 'Another product with the same name already exists.' });
    }

    const product = await Product.findByIdAndUpdate(
      _id,
      { product_name, product_price, updated_by: updatedBy },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ error: '_id parameter is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'Invalid _id format' });
    }

    const Product = req.tenantDb.model('TenantProduct', TenantProduct.schema);

    const product = await Product.findByIdAndDelete(_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
