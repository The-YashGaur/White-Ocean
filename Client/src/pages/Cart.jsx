import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import useCartStore from '../store/cartStore';
import { API_BASE_URL } from '../config';
import './Cart.css';

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getSubtotal,
  } = useCartStore();

  const API_URL = API_BASE_URL;

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://placehold.co/100x100?text=No+Image';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  };

  const subtotal = getSubtotal();
  const tax = subtotal * 0.05;
  const delivery = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const total = subtotal + tax + delivery;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page py-12">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="page-title mb-8">Shopping Cart</h1>

          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>

          <p style={{ color: 'var(--color-text-gray)', marginBottom: '2rem' }}>
            Add some products to continue shopping.
          </p>

          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page py-12">
      <div className="container">
        <h1 className="page-title mb-8">Shopping Cart</h1>

        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-header">
              <span className="col-product">Product</span>
              <span className="col-price">Price</span>
              <span className="col-qty">Quantity</span>
              <span className="col-total">Total</span>
              <span className="col-action"></span>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="col-product item-info">
                    <img
                      src={getImageUrl(item.productImage)}
                      alt={item.productName}
                      className="item-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://placehold.co/100x100?text=No+Image';
                      }}
                    />

                    <div>
                      <h3 className="item-name">{item.productName}</h3>
                      <p className="item-vendor">{item.sellerName}</p>
                    </div>
                  </div>

                  <div className="col-price item-price">
                    ₹{Number(item.price || 0).toFixed(2)}
                  </div>

                  <div className="col-qty">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(item._id)}
                      >
                        <Minus size={14} />
                      </button>

                      <span className="qty-val">{item.quantity}</span>

                      <button
                        className="qty-btn"
                        onClick={() => increaseQuantity(item._id)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="col-total item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>

                  <div className="col-action">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Tax / GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? 'Free' : `₹${delivery.toFixed(2)}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <Link to="/checkout" style={{ width: '100%', display: 'block' }}>
              <Button size="lg" className="checkout-btn">
                Proceed to Checkout <ArrowRight size={18} />
              </Button>
            </Link>

            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;