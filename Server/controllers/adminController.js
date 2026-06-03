const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate revenue using aggregation
    const revenueStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = revenueStats.length > 0 ? Number(revenueStats[0].totalRevenue.toFixed(2)) : 0;

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Placed', 'Processing', 'Packed'] }
    });

    const deliveredOrders = await Order.countDocuments({
      orderStatus: 'Delivered'
    });

    const lowStockProducts = await Product.countDocuments({
      stockQuantity: { $lt: 10 }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── USER MANAGEMENT ───────────────────────────────────────────

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const totalOrders = await Order.countDocuments({ user: user._id });
        const orders = await Order.find({ user: user._id });
        const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        return {
          ...user.toObject(),
          totalOrders,
          totalSpent: Number(totalSpent.toFixed(2))
        };
      })
    );
    res.status(200).json({ success: true, count: usersWithOrders.length, data: usersWithOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user status (Active/Blocked)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Blocked', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ success: true, message: `User status updated to ${status} successfully.`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── VENDOR MANAGEMENT ─────────────────────────────────────────

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).sort({ createdAt: -1 });
    const mappedVendors = await Promise.all(
      vendors.map(async (vendor) => {
        const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();
        
        // Find all orders that contain items from this vendor
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
        
        return {
          ...vendor.toObject(),
          id: vendor._id.toString(),
          name: vendorName,
          email: vendor.email,
          phone: vendor.phone,
          status: vendor.status,
          rating: 4.8, // default rating
          image: vendor.profileImage || 'https://images.unsplash.com/photo-1595853035070-59a39fe84dd3?auto=format&fit=crop&w=200&q=80',
          ordersCount,
          salesAmount: Number(salesAmount.toFixed(2))
        };
      })
    );
    res.status(200).json({ success: true, count: mappedVendors.length, data: mappedVendors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update vendor verification status (Approved/Suspended/Pending)
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Approved', 'Suspended', 'Pending', 'Active'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid status' });
    }

    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, error: 'Vendor profile not found' });
    }

    vendor.status = status;
    await vendor.save();

    res.status(200).json({ success: true, message: `Vendor status updated to ${status} successfully.`, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all pending vendor applications
// @route   GET /api/admin/vendors/applications
// @access  Private/Admin
const getVendorApplications = async (req, res) => {
  try {
    const applications = await User.find({
      'vendorApplication.isApplied': true,
      role: 'customer'
    }).sort({ 'vendorApplication.appliedAt': -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve vendor application and promote customer to vendor
// @route   PUT /api/admin/vendors/applications/:id/approve
// @access  Private/Admin
const approveVendorApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.vendorApplication?.isApplied) {
      return res.status(400).json({ success: false, error: 'This user has not submitted a vendor application' });
    }

    user.role = 'vendor';
    user.status = 'Active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} successfully promoted to Certified Vendor!`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PRODUCT MANAGEMENT ────────────────────────────────────────

// @desc    Get all products (admin view - includes hidden & pending approval)
// @route   GET /api/admin/products
// @access  Private/Admin
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle product approval status
// @route   PUT /api/admin/products/:id/approval
// @access  Private/Admin
const updateProductApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    if (isApproved === undefined) {
      return res.status(400).json({ success: false, error: 'Please specify isApproved status' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.isApproved = isApproved;
    await product.save();

    res.status(200).json({ success: true, message: `Product approval state updated successfully.`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle product hidden status
// @route   PUT /api/admin/products/:id/hide
// @access  Private/Admin
const updateProductVisibility = async (req, res) => {
  try {
    const { isHidden } = req.body;
    if (isHidden === undefined) {
      return res.status(400).json({ success: false, error: 'Please specify isHidden status' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.isHidden = isHidden;
    await product.save();

    res.status(200).json({ success: true, message: `Product visibility state updated successfully.`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── COUPON MANAGEMENT (CRUD) ──────────────────────────────────

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new coupon code
// @route   POST /api/admin/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, usageLimit, expiryDate } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      usageLimit,
      expiryDate
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully.', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a coupon code
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    res.status(200).json({ success: true, message: 'Coupon updated successfully.', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a coupon code
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── NOTIFICATION ANNOUNCEMENTS (CRUD) ─────────────────────────

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new notification board post
// @route   POST /api/admin/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type
    });

    res.status(201).json({ success: true, message: 'Notification created successfully.', data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle notification status (Active/Expired)
// @route   PUT /api/admin/notifications/:id/status
// @access  Private/Admin
const updateNotificationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Expired'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid status' });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification record not found' });
    }

    notification.status = status;
    await notification.save();

    res.status(200).json({ success: true, message: `Notification updated to ${status}.`, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── ORDER MANAGEMENT ──────────────────────────────────────────

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update order delivery status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!orderStatus) {
      return res.status(400).json({ success: false, error: 'Please provide orderStatus' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.paymentStatus = 'Paid';
      order.isPaid = true;
      order.paidAt = order.paidAt || new Date();
    }

    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${orderStatus} successfully.`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PAYMENT MANAGEMENT ────────────────────────────────────────

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
const Payment = require('../models/Payment');

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    const mappedPayments = payments.map(p => ({
      ...p.toObject(),
      id: p._id.toString(),
      orderId: p.order ? p.order.toString() : '',
      customer: p.customerName || '',
      amount: p.amount || 0,
      paymentMethod: p.paymentMethod || 'COD',
      status: p.status || 'Pending',
      createdAt: p.createdAt
    }));
    res.status(200).json({ success: true, count: mappedPayments.length, data: mappedPayments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── SETTINGS MANAGEMENT ───────────────────────────────────────

// @desc    Get global website settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update global website settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, message: 'Settings updated successfully.', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a notification board post
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  updateUserStatus,
  getVendors,
  updateVendorStatus,
  getVendorApplications,
  approveVendorApplication,
  getProducts,
  updateProductApproval,
  updateProductVisibility,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getNotifications,
  createNotification,
  updateNotificationStatus,
  getOrders,
  updateOrderStatus,
  getPayments,
  getSettings,
  updateSettings,
  deleteNotification
};
