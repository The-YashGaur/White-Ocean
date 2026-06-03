const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');

const { protect, admin } = require('../middleware/authMiddleware');

// Secure all admin routes
router.use(protect);
router.use(admin);

// Analytics
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

// Vendors
router.get('/vendors', getVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/vendors/applications', getVendorApplications);
router.put('/vendors/applications/:id/approve', approveVendorApplication);

// Products
router.get('/products', getProducts);
router.put('/products/:id/approval', updateProductApproval);
router.put('/products/:id/hide', updateProductVisibility);

// Orders
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Coupons
router.route('/coupons')
  .get(getCoupons)
  .post(createCoupon);
router.route('/coupons/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

// Payments
router.get('/payments', getPayments);

// Settings
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

// Notifications
router.route('/notifications')
  .get(getNotifications)
  .post(createNotification);
router.put('/notifications/:id/status', updateNotificationStatus);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
