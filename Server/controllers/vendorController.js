const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get Vendor Store Analytics
// @route   GET /api/vendor/analytics
// @access  Private/Vendor
const getVendorAnalytics = async (req, res) => {
  try {
    const vendorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    
    // Find all products by this vendor
    const products = await Product.find({ sellerName: vendorName });
    const totalProducts = products.length;
    
    // Calculate rating average
    const avgRating = products.length > 0
      ? Number((products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1))
      : 5.0;

    // Find all non-cancelled orders that contain items from this vendor
    const allOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    
    let ordersCount = 0;
    let salesAmount = 0;
    
    for (const order of allOrders) {
      let hasItemFromVendor = false;
      for (const item of order.orderItems) {
        if (item.sellerName && item.sellerName.toLowerCase() === vendorName.toLowerCase()) {
          hasItemFromVendor = true;
          salesAmount += item.price * item.quantity;
        }
      }
      if (hasItemFromVendor) {
        ordersCount++;
      }
    }

    const lowStockProducts = await Product.countDocuments({
      sellerName: vendorName,
      stockQuantity: { $lt: 10 }
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        ordersCount,
        salesAmount: Number(salesAmount.toFixed(2)),
        avgRating,
        lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Vendor-Specific Orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
const getVendorOrders = async (req, res) => {
  try {
    const vendorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    
    // Find orders that contain items from this vendor
    const allOrders = await Order.find().sort({ createdAt: -1 });
    const vendorOrders = [];

    for (const order of allOrders) {
      const vendorItems = order.orderItems.filter(
        item => item.sellerName && item.sellerName.toLowerCase() === vendorName.toLowerCase()
      );

      if (vendorItems.length > 0) {
        const orderObj = order.toObject();
        // Calculate vendor-specific order price
        const vendorSubtotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        vendorOrders.push({
          ...orderObj,
          vendorSubtotal: Number(vendorSubtotal.toFixed(2)),
          vendorItems
        });
      }
    }

    res.status(200).json({ success: true, count: vendorOrders.length, data: vendorOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Vendor-Specific Products Catalog
// @route   GET /api/vendor/products
// @access  Private/Vendor
const getVendorProducts = async (req, res) => {
  try {
    const vendorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    const products = await Product.find({ sellerName: vendorName }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create Vendor Catalog Product
// @route   POST /api/vendor/products
// @access  Private/Vendor
const createVendorProduct = async (req, res) => {
  try {
    const vendorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    const { productName, category, price, stockQuantity, productImage, description } = req.body;

    if (!productName || !category || price === undefined || stockQuantity === undefined || !productImage) {
      return res.status(400).json({ success: false, error: 'Please enter all required product details' });
    }

    const product = await Product.create({
      productName,
      category,
      sellerName: vendorName,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      productImage,
      description: description || '',
      isApproved: true, // Authorized vendors are certified: auto-approve products
      isHidden: false
    });

    res.status(201).json({ success: true, message: 'Product published to your store catalog successfully!', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete Vendor Catalog Product
// @route   DELETE /api/vendor/products/:id
// @access  Private/Vendor
const deleteVendorProduct = async (req, res) => {
  try {
    const vendorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Verify ownership
    if (product.sellerName.toLowerCase() !== vendorName.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete other vendor products' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Store catalog product expunged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVendorAnalytics,
  getVendorOrders,
  getVendorProducts,
  createVendorProduct,
  deleteVendorProduct
};
