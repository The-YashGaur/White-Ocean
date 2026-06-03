const express = require('express');
const router = express.Router();
const {
  getVendorAnalytics,
  getVendorOrders,
  getVendorProducts,
  createVendorProduct,
  deleteVendorProduct
} = require('../controllers/vendorController');

const { protect, vendor } = require('../middleware/authMiddleware');

// Secure all vendor portal routes
router.use(protect);
router.use(vendor);

// Analytics
router.get('/analytics', getVendorAnalytics);

// Orders
router.get('/orders', getVendorOrders);

// Products
router.route('/products')
  .get(getVendorProducts)
  .post(createVendorProduct);

router.delete('/products/:id', deleteVendorProduct);

module.exports = router;
