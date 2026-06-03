const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, rating } = req.query;

    let filter = {
      isApproved: true,
      isHidden: false
    };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.productName = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else sortOption = { createdAt: -1 }; // default: newest first

    const products = await Product.find(filter).sort(sortOption);

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all unique categories from products in DB
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories.sort() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

// @desc    Get global website settings (public)
// @route   GET /api/products/settings
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const User = require('../models/User');

// @desc    Get all approved vendors (public)
// @route   GET /api/products/vendors
// @access  Public
const getPublicVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', status: 'Active' }).sort({ createdAt: -1 });
    const mapped = vendors.map(v => ({
      _id: v._id,
      id: v._id.toString(),
      name: `${v.firstName} ${v.lastName}`.trim(),
      email: v.email,
      phone: v.phone,
      rating: 4.8,
      image: v.profileImage || 'https://images.unsplash.com/photo-1595853035070-59a39fe84dd3?auto=format&fit=crop&w=200&q=80',
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all active announcements (public)
// @route   GET /api/products/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Notification.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getProducts, getProductById, getCategories, getPublicSettings, getAnnouncements, getPublicVendors };

