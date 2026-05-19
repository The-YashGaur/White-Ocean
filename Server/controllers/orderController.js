const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      saveAddress,
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

    const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
    const deliveryPrice = itemsPrice > 500 ? 0 : 40;
    const totalPrice = Number((itemsPrice + taxPrice + deliveryPrice).toFixed(2));

    const normalizedPaymentMethod = paymentMethod.toUpperCase();

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
      totalPrice,
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};