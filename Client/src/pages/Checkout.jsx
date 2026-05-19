import React, { useState } from 'react';
import { CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import useCartStore from '../store/cartStore';
import useOrderStore from '../store/orderStore';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, getSubtotal, clearCart } = useCartStore();
  const { createOrder, isLoading } = useOrderStore();

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

  const subtotal = getSubtotal();
  const tax = subtotal * 0.05;
  const delivery = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const total = subtotal + tax + delivery;

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

    const orderData = {
      orderItems: cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),

      shippingAddress: addressData,
      paymentMethod,
      saveAddress,
    };

    const result = await createOrder(orderData);

    if (result.success) {
      alert(`Order placed successfully! Total Amount: ₹${result.data.totalPrice.toFixed(2)}`);
      clearCart();
      navigate('/profile');
    } else {
      alert(result.error || 'Order failed');
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
                <div className="form-grid mt-6">
                  <div className="form-group full-width">
                    <label>Card Number</label>
                    <input type="text" className="form-input" placeholder="0000 0000 0000 0000" />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" />
                  </div>

                  <div className="form-group">
                    <label>CVC</label>
                    <input type="text" className="form-input" placeholder="123" />
                  </div>

                  <div className="form-group full-width">
                    <label>Name on Card</label>
                    <input type="text" className="form-input" placeholder="Enter card holder name" />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="form-grid mt-6">
                  <div className="form-group full-width">
                    <label>UPI ID</label>
                    <input type="text" className="form-input" placeholder="example@upi" />
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

              <div className="summary-calc">
                <div className="s-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="s-row">
                  <span>GST / Tax (5%)</span>
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