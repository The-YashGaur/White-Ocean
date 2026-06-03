import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import useCartStore from '../store/cartStore';
import useOrderStore from '../store/orderStore';
import useProductStore from '../store/productStore';
import useAuthStore from '../store/authStore';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { cartItems, getSubtotal, clearCart } = useCartStore();
  const { createOrder, validateCoupon, createRazorpaySession, isLoading } = useOrderStore();
  const { fetchSettings } = useProductStore();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [saveAddress, setSaveAddress] = useState(true);

  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pinCode: '',
    landmark: '',
  });

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCouponValidating, setIsCouponValidating] = useState(false);

  // Settings State
  const [activeSettings, setActiveSettings] = useState({
    taxPercentage: 5,
    freeDeliveryMin: 500,
    deliveryCharge: 40
  });

  useEffect(() => {
    const loadSettings = async () => {
      const s = await fetchSettings();
      if (s) {
        setActiveSettings({
          taxPercentage: s.taxPercentage ?? 5,
          freeDeliveryMin: s.freeDeliveryMin ?? 500,
          deliveryCharge: s.deliveryCharge ?? 40
        });
      }
    };
    loadSettings();
  }, [fetchSettings]);

  const subtotal = getSubtotal();
  const tax = subtotal * (activeSettings.taxPercentage / 100);
  const delivery = subtotal >= activeSettings.freeDeliveryMin || subtotal === 0 ? 0 : activeSettings.deliveryCharge;

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = subtotal * (appliedCoupon.discountValue / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const total = subtotal - discount + tax + delivery;

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    setIsCouponValidating(true);
    const result = await validateCoupon(couponCode, subtotal);
    setIsCouponValidating(false);

    if (result.success) {
      setAppliedCoupon(result.data);
    } else {
      setCouponError(result.error || 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    if (!addressData.fullName.trim()) return 'Full name is required';
    if (!addressData.phone.trim()) return 'Phone number is required';
    if (!addressData.address.trim()) return 'Address is required';
    if (!addressData.city.trim()) return 'City is required';
    if (!addressData.pinCode.trim()) return 'PIN code is required';

    return null;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      navigate('/cart');
      return;
    }

    const addressError = validateAddress();

    if (addressError) {
      alert(addressError);
      return;
    }

    if (paymentMethod === 'card' || paymentMethod === 'upi') {
      const sessionResult = await createRazorpaySession(
        cartItems.map((item) => ({ product: item._id, quantity: item.quantity })),
        appliedCoupon ? appliedCoupon.code : undefined
      );

      if (!sessionResult.success) {
        alert(sessionResult.error || 'Failed to initiate secure payment session');
        return;
      }

      const options = {
        key: sessionResult.keyId,
        amount: sessionResult.amount,
        currency: sessionResult.currency,
        name: 'White Ocean Store',
        description: 'Secure Order Payment',
        order_id: sessionResult.razorpayOrderId,
        handler: async function (response) {
          const finalOrderData = {
            orderItems: cartItems.map((item) => ({
              product: item._id,
              quantity: item.quantity,
            })),
            shippingAddress: addressData,
            paymentMethod: paymentMethod.toUpperCase(),
            saveAddress,
            couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const orderResult = await createOrder(finalOrderData);

          if (orderResult.success) {
            alert(`Order placed successfully! Total Amount: ₹${orderResult.data.totalPrice.toFixed(2)}`);
            clearCart();
            navigate('/profile');
          } else {
            alert(orderResult.error || 'Failed to complete order verification.');
          }
        },
        prefill: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          email: user?.email || '',
          contact: addressData.phone || user?.phone || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } else {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: addressData,
        paymentMethod: 'COD',
        saveAddress,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const result = await createOrder(orderData);

      if (result.success) {
        alert(`Order placed successfully! Total Amount: ₹${result.data.totalPrice.toFixed(2)}`);
        clearCart();
        navigate('/profile');
      } else {
        alert(result.error || 'Order failed');
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page py-12">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h1 className="page-title mb-8">Checkout</h1>
          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--color-text-gray)', marginBottom: '2rem' }}>
            Please add products to cart before checkout.
          </p>

          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page py-12">
      <div className="container">
        <h1 className="page-title mb-8">Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-forms">
            <div className="checkout-card">
              <h2 className="card-title">
                <Truck size={20} className="text-primary" /> Shipping Address
              </h2>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="Enter full name"
                    value={addressData.fullName}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={addressData.phone}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Full Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="House no, street, area"
                    value={addressData.address}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    placeholder="Enter city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    className="form-input"
                    placeholder="Enter PIN code"
                    value={addressData.pinCode}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Landmark / Optional</label>
                  <input
                    type="text"
                    name="landmark"
                    className="form-input"
                    placeholder="Nearby landmark"
                    value={addressData.landmark}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                    />
                    Save this address for future orders
                  </label>
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <h2 className="card-title">
                <CreditCard size={20} className="text-primary" /> Payment Method
              </h2>

              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div className="option-content">
                    <span className="font-semibold">Credit/Debit Card</span>
                    <div className="card-icons">💳</div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <div className="option-content">
                    <span className="font-semibold">UPI</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="option-content">
                    <span className="font-semibold">Cash on Delivery</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="payment-gateway-notice mt-6 p-4 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="text-primary text-xl">🛡️</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-gray)', textAlign: 'left' }}>
                    <p className="font-semibold" style={{ color: 'var(--color-text-dark)', marginBottom: '4px' }}>Secure Card Payment via Razorpay</p>
                    <p style={{ margin: 0 }}>After clicking "Place Order", the secure Razorpay Checkout will open to safely complete your transaction.</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="payment-gateway-notice mt-6 p-4 rounded-lg bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="text-primary text-xl">⚡</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-gray)', textAlign: 'left' }}>
                    <p className="font-semibold" style={{ color: 'var(--color-text-dark)', marginBottom: '4px' }}>Instant UPI Payment via Razorpay</p>
                    <p style={{ margin: 0 }}>After clicking "Place Order", you can pay instantly using Google Pay, PhonePe, Paytm, or any UPI ID in the secure Razorpay portal.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-summary-sidebar">
            <div className="checkout-card sticky-card">
              <h2 className="card-title">Order Summary</h2>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div className="s-item" key={item._id}>
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              {/* Promo Coupon Section */}
              <div className="coupon-section mt-4 mb-4" style={{ padding: '0.5rem 0' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Apply Promo Code</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ textTransform: 'uppercase', padding: '0.4rem 0.75rem', fontSize: '0.9rem', flexGrow: 1 }}
                    placeholder="e.g. SAVE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={appliedCoupon !== null}
                  />
                  {appliedCoupon ? (
                    <Button
                      size="sm"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', backgroundColor: '#ef4444' }}
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                      onClick={handleApplyCoupon}
                      disabled={isCouponValidating}
                    >
                      {isCouponValidating ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
                {couponError && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>
                    Code {appliedCoupon.code} applied successfully!
                  </p>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-calc">
                <div className="s-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="s-row" style={{ color: '#22c55e', fontWeight: 600 }}>
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="s-row">
                  <span>GST / Tax ({activeSettings.taxPercentage}%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <div className="s-row">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? 'Free' : `₹${delivery.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="s-row s-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full mt-6 flex justify-center items-center gap-2"
                onClick={handlePlaceOrder}
                disabled={isLoading}
              >
                <CheckCircle2 size={20} />
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;