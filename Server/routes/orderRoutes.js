const express = require('express');
const {
  createRazorpaySession,
  createOrder,
  getMyOrders,
  getOrderById,
  validateCoupon,
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/razorpay-session', protect, createRazorpaySession);
router.post('/validate-coupon', protect, validateCoupon);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;