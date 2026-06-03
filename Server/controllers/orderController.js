const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key'
});

const createRazorpaySession = async (req, res) => {
  try {
    const { orderItems, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No items in cart to generate session',
      });
    }

    let itemsPrice = 0;
    for (const item of orderItems) {
      const productId = item.product || item._id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found`,
        });
      }
      const quantity = Number(item.quantity || 1);
      itemsPrice += Number(product.price) * quantity;
    }

    let discountPrice = 0;
    if (couponCode) {
      const couponObj = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (
        couponObj &&
        new Date() <= new Date(couponObj.expiryDate) &&
        itemsPrice >= couponObj.minOrderAmount &&
        couponObj.usedCount < couponObj.usageLimit
      ) {
        if (couponObj.discountType === 'percentage') {
          discountPrice = Number((itemsPrice * (couponObj.discountValue / 100)).toFixed(2));
        } else {
          discountPrice = Number(couponObj.discountValue);
        }
      }
    }

    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const deliveryPrice = itemsPrice > 500 ? 0 : 40;
    const totalPrice = Number((itemsPrice - discountPrice + taxPrice + deliveryPrice).toFixed(2));

    const options = {
      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      itemsPrice,
      taxPrice,
      deliveryPrice,
      discountPrice,
      totalPrice
    });
  } catch (error) {
    console.error('Razorpay session error:', error);
    const errorMsg = error.error?.description || error.description || error.message || 'Failed to initiate secure payment session';
    return res.status(500).json({
      success: false,
      error: errorMsg,
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      saveAddress,
      couponCode,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No order items found',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.pinCode
    ) {
      return res.status(400).json({
        success: false,
        error: 'Complete shipping address is required',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required',
      });
    }

    const finalOrderItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const productId = item.product || item._id;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productName || productId}`,
        });
      }

      const quantity = Number(item.quantity || 1);

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          error: `${product.productName} has only ${product.stockQuantity} items in stock`,
        });
      }

      const price = Number(product.price);
      itemsPrice += price * quantity;

      finalOrderItems.push({
        product: product._id,
        productName: product.productName,
        productImage: product.productImage,
        sellerName: product.sellerName,
        price,
        quantity,
      });
    }

    let discountPrice = 0;
    if (couponCode) {
      const couponObj = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (
        couponObj &&
        new Date() <= new Date(couponObj.expiryDate) &&
        itemsPrice >= couponObj.minOrderAmount &&
        couponObj.usedCount < couponObj.usageLimit
      ) {
        if (couponObj.discountType === 'percentage') {
          discountPrice = Number((itemsPrice * (couponObj.discountValue / 100)).toFixed(2));
        } else {
          discountPrice = Number(couponObj.discountValue);
        }
        // Increment usedCount
        couponObj.usedCount += 1;
        await couponObj.save();
      }
    }

    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const deliveryPrice = itemsPrice > 500 ? 0 : 40;
    const totalPrice = Number((itemsPrice - discountPrice + taxPrice + deliveryPrice).toFixed(2));

    const normalizedPaymentMethod = paymentMethod.toUpperCase();

    if (normalizedPaymentMethod === 'CARD' || normalizedPaymentMethod === 'UPI') {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          error: 'Razorpay payment details are missing',
        });
      }

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key')
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          error: 'Payment verification failed. Invalid signature.',
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,

      customerSnapshot: {
        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
        email: req.user.email,
        phone: req.user.phone || req.user.mobile || '',
      },

      orderItems: finalOrderItems,
      shippingAddress,

      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentMethod === 'COD' ? 'Pending' : 'Paid',
      isPaid: normalizedPaymentMethod !== 'COD',
      paidAt: normalizedPaymentMethod !== 'COD' ? new Date() : undefined,

      itemsPrice,
      taxPrice,
      deliveryPrice,
      discountPrice,
      couponCode: couponCode ? couponCode.toUpperCase() : '',
      totalPrice,
    });

    const Payment = require('../models/Payment');
    await Payment.create({
      order: order._id,
      user: req.user._id,
      customerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
      amount: totalPrice,
      paymentMethod: normalizedPaymentMethod,
      status: normalizedPaymentMethod === 'COD' ? 'Pending' : 'Success',
    });

    for (const item of finalOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    if (saveAddress && req.user.addresses) {
      const alreadyExists = req.user.addresses.some(
        (addr) =>
          addr.address === shippingAddress.address &&
          addr.phone === shippingAddress.phone &&
          addr.pinCode === shippingAddress.pinCode
      );

      if (!alreadyExists) {
        req.user.addresses.push({
          ...shippingAddress,
          isDefault: req.user.addresses.length === 0,
        });

        await req.user.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to place order',
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }

    const isExpired = new Date() > new Date(coupon.expiryDate);
    if (isExpired) {
      return res.status(400).json({ success: false, error: 'This coupon has expired' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount of ₹${coupon.minOrderAmount} is required to use this coupon`,
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'This coupon usage limit has been reached' });
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  createRazorpaySession,
  createOrder,
  getMyOrders,
  getOrderById,
  validateCoupon,
};