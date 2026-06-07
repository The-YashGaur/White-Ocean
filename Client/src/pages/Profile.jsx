import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Lock,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  Edit2,
  Save,
  X,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  Package,
  Star,
  ChevronLeft,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import useOrderStore from '../store/orderStore';
import { API_BASE_URL } from '../config';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { orders, fetchMyOrders, isLoading: ordersLoading } = useOrderStore();

  const [verifyingType, setVerifyingType] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (user) {
      setEditData({
        ...user,
        preferences: user.preferences || {
          newsletter: true,
          smsNotifications: false,
          promotionalEmails: true,
        },
      });
    }
  }, [user]);

  const recentOrders = orders.slice(0, 3);

  const totalOrders = orders.length;

  const activeOrders = orders.filter((order) =>
    ['Placed', 'Processing', 'Packed', 'Out for Delivery'].includes(order.orderStatus)
  ).length;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatOrderId = (id) => {
    if (!id) return '#ORD';
    return `#ORD-${id.slice(-6).toUpperCase()}`;
  };

  const getOrderItemsCount = (order) => {
    return order.orderItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Out for Delivery':
      case 'Packed':
        return 'warning';
      case 'Placed':
      case 'Processing':
        return 'info';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const startVerification = async (type) => {
    setVerifyingType(type);
    setVerificationError('');
    setOtpCode('');
    setVerificationLoading(true);
    setSimulatedOtp('');

    try {
      const url =
        type === 'email'
          ? `${API_BASE_URL}/api/auth/send-email-otp`
          : `${API_BASE_URL}/api/auth/send-otp`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(type === 'email' ? { email: user?.email } : { type }),
      });

      const data = await response.json();
      setVerificationLoading(false);

      if (data.success) {
        if (type === 'email') {
          setResendCooldown(60);
        }

        if (type === 'phone' && data.otp) {
          setSimulatedOtp(data.otp);
        }
      } else {
        setVerificationError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setVerificationLoading(false);
      setVerificationError('Network error. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setVerificationError('Please enter a valid 6-digit verification code.');
      return;
    }

    setVerificationLoading(true);
    setVerificationError('');

    try {
      const url =
        verifyingType === 'email'
          ? `${API_BASE_URL}/api/auth/verify-email-otp`
          : `${API_BASE_URL}/api/auth/verify-otp`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(
          verifyingType === 'email'
            ? { email: user?.email, otp: otpCode }
            : { type: verifyingType, otp: otpCode }
        ),
      });

      const data = await response.json();
      setVerificationLoading(false);

      if (data.success) {
        useAuthStore.setState({ user: data.data });
        setVerifyingType(null);
        setSimulatedOtp('');
      } else {
        setVerificationError(data.error || 'Verification failed. Invalid code.');
      }
    } catch (err) {
      setVerificationLoading(false);
      setVerificationError('Network error. Please try again.');
    }
  };

  const handleEdit = () => {
    setActiveTab('personal');
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        ...user,
        preferences: user.preferences || {
          newsletter: true,
          smsNotifications: false,
          promotionalEmails: true,
        },
      });
    }

    setIsEditing(false);
  };

  const handleSave = async () => {
    const result = await updateProfile(editData);

    if (result.success) {
      setIsEditing(false);
    } else {
      console.error('Failed to update profile:', result.error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        let imagePath = await response.text();
        imagePath = imagePath.trim().replace(/^"|"$/g, '');

        setEditData((prev) => ({
          ...prev,
          profileImage: imagePath,
        }));

        await updateProfile({ profileImage: imagePath });
      } else {
        console.error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // const handleLogout = () => {
  //   logout();
  //   navigate('/');
  // };

  const handleLogout = async () => {
      await logout();
      setShowLogoutModal(false);
      navigate('/');
    };

  const handlePreferenceChange = (key, value) => {
    setEditData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="profile-overview"
    >
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={
              user?.profileImage
                ? user.profileImage.startsWith('/uploads')
                  ? `${API_BASE_URL}${user.profileImage}`
                  : user.profileImage
                : `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || ''}&background=random`
            }
            alt="Profile"
          />
          <div className="avatar-badge">
            <Star size={16} />
          </div>
        </div>

        <div className="profile-info">
          <h2>
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="profile-email">{user?.email}</p>

          <div className="profile-badges">
            <span className="badge membership">{user?.membershipLevel || 'Silver'} Member</span>
            <span className="badge member-since">Since {user?.memberSince || '2024'}</span>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleEdit} className="edit-profile-btn">
          <Edit2 size={16} /> Edit Profile
        </Button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h3>0</h3>
            <p>Favorites</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>{activeOrders}</h3>
            <p>Active Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h3>4.8</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>

        <div className="orders-list">
          {ordersLoading ? (
            <p>Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="order-item" onClick={() => { setActiveTab('orders'); setSelectedOrder(order); }} style={{ cursor: 'pointer' }}>
                <div className="order-info">
                  <h4>{formatOrderId(order._id)}</h4>
                  <p>
                    {formatDate(order.createdAt)} • {getOrderItemsCount(order)} items
                  </p>
                </div>

                <div className="order-total">
                  <span className="amount">₹{Number(order.totalPrice || 0).toFixed(2)}</span>
                  <span className={`status ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <ChevronRight size={20} className="order-arrow" />
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="personal-info"
    >
      <div className="section-header">
        <h3>Personal Information</h3>

        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit2 size={16} /> Edit
          </Button>
        ) : (
          <div className="edit-actions">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
              <X size={16} /> Cancel
            </Button>

            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <div className="spinner-small"></div> : <><Save size={16} /> Save</>}
            </Button>
          </div>
        )}
      </div>

      {isEditing && (
        <div
          className="profile-image-edit"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <img
            src={
              editData.profileImage
                ? editData.profileImage.startsWith('/uploads')
                  ? `${API_BASE_URL}${editData.profileImage}`
                  : editData.profileImage
                : user?.profileImage
                  ? user.profileImage.startsWith('/uploads')
                    ? `${API_BASE_URL}${user.profileImage}`
                    : user.profileImage
                  : `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || ''}&background=random`
            }
            alt="Profile Preview"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '1rem',
              border: '2px solid #00AEEF',
            }}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
            Upload New Picture
          </Button>
        </div>
      )}

      <div className="info-grid">
        <div className="form-group">
          <label>First Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editData.firstName || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="form-input"
            />
          ) : (
            <span>{user?.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editData.lastName || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="form-input"
            />
          ) : (
            <span>{user?.lastName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <span>{user?.email}</span>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <span>{user?.phone}</span>
        </div>

        <div className="form-group full-width">
          <label>Delivery Address</label>
          {isEditing ? (
            <input
              type="text"
              value={editData.address || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
              className="form-input"
            />
          ) : (
            <span>{user?.address}</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderOrderDetailView = () => {
    if (!selectedOrder) return null;

    const statusSteps = ['Placed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'];
    const currentStatusIndex = statusSteps.indexOf(selectedOrder.orderStatus);
    const isCancelled = selectedOrder.orderStatus === 'Cancelled';

    return (
      <div className="order-detail-view" style={{ animation: 'fadeIn 0.3s ease' }}>
        <button 
          className="back-to-orders-btn" 
          onClick={() => setSelectedOrder(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}
        >
          <ArrowLeft size={18} /> Back to Orders
        </button>

        <div className="order-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--color-text-dark)' }}>Order Detail</h3>
            <p style={{ color: 'var(--color-text-gray)', margin: '0.25rem 0 0 0' }}>ID: <code style={{ fontSize: '0.95rem' }}>{selectedOrder._id}</code></p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`status ${getStatusColor(selectedOrder.orderStatus)}`} style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>
              {selectedOrder.orderStatus}
            </span>
            <p style={{ color: 'var(--color-text-gray)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Ordered on {formatDate(selectedOrder.createdAt)}</p>
          </div>
        </div>

        {/* Cancelled Alert Banner */}
        {isCancelled && (
          <div style={{ display: 'flex', gap: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fee2e2', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <X size={22} color="#dc2626" />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1.05rem', fontWeight: 600 }}>Order Cancelled</h4>
              <p style={{ margin: '0.2rem 0 0 0', color: '#7f1d1d', fontSize: '0.9rem', lineHeight: 1.5 }}>This order has been cancelled and will not be processed further. If payment was collected, it will be refunded shortly.</p>
            </div>
          </div>
        )}

        {/* Visual order timeline */}
        {!isCancelled && (
          <div className="tracking-timeline-card" style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1.5rem 2rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--color-primary)" /> Visual Tracking Timeline
            </h4>
            <div className="timeline-steps-container">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isActive = idx === currentStatusIndex;

                let StepIcon = Package;
                if (step === 'Placed') StepIcon = ShoppingBag;
                if (step === 'Processing') StepIcon = Clock;
                if (step === 'Packed') StepIcon = Package;
                if (step === 'Out for Delivery') StepIcon = Truck;
                if (step === 'Delivered') StepIcon = CheckCircle2;

                return (
                  <div key={step} className={`timeline-step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-badge">
                      <StepIcon size={18} />
                    </div>
                    <div className="step-label">{step}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Invoice and Address Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }} className="order-grid-layout">
          
          {/* Order Items Listing */}
          <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 600 }}>Items in Order</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedOrder.orderItems?.map((item, idx) => (
                <div key={idx} className="detail-order-item" style={{ paddingBottom: idx < selectedOrder.orderItems.length - 1 ? '1.25rem' : '0', borderBottom: idx < selectedOrder.orderItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <img
                    src={item.productImage.startsWith('/uploads') ? `${API_BASE_URL}${item.productImage}` : item.productImage}
                    alt={item.productName}
                    className="detail-order-item-img"
                  />
                  <div className="detail-order-item-info">
                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>{item.productName}</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-gray)' }}>Seller: <span style={{ fontWeight: 500 }}>{item.sellerName}</span></p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', fontWeight: 500 }}>₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="detail-order-item-price">
                    ₹{Number(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info + Invoice Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Delivery address card */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Delivery Information</h4>
              {selectedOrder.shippingAddress ? (
                <div style={{ fontSize: '0.925rem', lineHeight: 1.6, color: 'var(--color-text-dark)' }}>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{selectedOrder.shippingAddress.fullName}</p>
                  <p style={{ margin: '0 0 0.25rem 0' }}>{selectedOrder.shippingAddress.address}</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>{selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.pinCode}</p>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📞 {selectedOrder.shippingAddress.phone}
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, color: 'var(--color-text-gray)' }}>No shipping details found.</p>
              )}
            </div>

            {/* Payment Summary */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Payment Method</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                {selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : selectedOrder.paymentMethod}
              </p>
              <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '50px', background: selectedOrder.paymentStatus === 'Paid' ? '#f0fdf4' : '#fffbc6', border: '1px solid ' + (selectedOrder.paymentStatus === 'Paid' ? '#bbf7d0' : '#fef08a') }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedOrder.paymentStatus === 'Paid' ? '#22c55e' : '#eab308' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedOrder.paymentStatus === 'Paid' ? '#166534' : '#854d0e' }}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Invoice summary card */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Billing Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-gray)' }}>
                  <span>Items Subtotal</span>
                  <span>₹{Number(selectedOrder.itemsPrice || selectedOrder.totalPrice).toFixed(2)}</span>
                </div>
                {selectedOrder.discountPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', fontWeight: 500 }}>
                    <span>Coupon Discount ({selectedOrder.couponCode})</span>
                    <span>-₹{Number(selectedOrder.discountPrice).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-gray)' }}>
                  <span>Delivery Charge</span>
                  <span>₹{Number(selectedOrder.deliveryPrice || 0).toFixed(2)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-dark)' }}>
                  <span>Grand Total</span>
                  <span>₹{Number(selectedOrder.totalPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="orders-section"
    >
      {selectedOrder ? (
        renderOrderDetailView()
      ) : (
        <>
          <h3>Order History</h3>

          {ordersLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found. Start shopping to place your first order.</p>
          ) : (
            <div className="orders-table">
              <div className="table-header">
                <span>Order ID</span>
                <span>Date</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span>Payment</span>
              </div>

              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="table-row clickable" 
                  onClick={() => setSelectedOrder(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="order-id">{formatOrderId(order._id)}</span>
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{getOrderItemsCount(order)} items</span>
                  <span className="amount">₹{Number(order.totalPrice || 0).toFixed(2)}</span>
                  <span className={`status ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span>
                    {order.paymentMethod} / {order.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  const renderPreferences = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="preferences-section"
    >
      <h3>Preferences</h3>

      <div className="preference-group">
        <h4>Notifications</h4>

        <div className="preference-item">
          <div className="preference-info">
            <Bell size={20} />
            <div>
              <h5>Email Notifications</h5>
              <p>Receive order updates and promotions via email</p>
            </div>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={editData.preferences?.newsletter || false}
              onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <Phone size={20} />
            <div>
              <h5>SMS Notifications</h5>
              <p>Get text messages for order status updates</p>
            </div>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={editData.preferences?.smsNotifications || false}
              onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <CreditCard size={20} />
            <div>
              <h5>Promotional Offers</h5>
              <p>Receive special deals and discount codes</p>
            </div>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={editData.preferences?.promotionalEmails || false}
              onChange={(e) => handlePreferenceChange('promotionalEmails', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="preference-group">
        <h4>Security</h4>
        <div className="security-actions">
          <Button variant="outline" className="security-btn">
            <Lock size={16} /> Change Password
          </Button>

          <Button variant="outline" className="security-btn">
            <Shield size={16} /> Two-Factor Authentication
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderVerificationModal = () => {
    if (!verifyingType) return null;

    return (
      <div className="otp-modal-overlay">
        <div className="otp-modal-content">
          <div className="otp-modal-header">
            <h3>
              Verify your {verifyingType === 'email' ? 'Email Address' : 'Phone Number'}
            </h3>

            <button
              className="close-btn"
              onClick={() => setVerifyingType(null)}
              disabled={verificationLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="otp-modal-body">
            <p className="otp-info-text">
              We have sent a 6-digit verification code to your registered{' '}
              {verifyingType === 'email' ? 'email' : 'phone'}:
              <strong
                style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  color: 'var(--color-primary)',
                  fontSize: '1.1rem',
                }}
              >
                {verifyingType === 'email' ? user?.email : user?.phone}
              </strong>
            </p>

            {verifyingType !== 'email' && simulatedOtp && (
              <div className="simulated-otp-banner">
                <span className="banner-icon">📱</span>
                <div className="banner-text">
                  <h5>Development Simulation</h5>
                  <p>
                    Your OTP code has arrived: <strong>{simulatedOtp}</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="otp-input-container">
              <label>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className={`otp-input ${verificationError ? 'input-error' : ''}`}
                disabled={verificationLoading}
              />

              {verificationError && <span className="otp-error-text">{verificationError}</span>}
            </div>

            <div className="otp-modal-actions">
              <Button
                variant="ghost"
                onClick={() => setVerifyingType(null)}
                disabled={verificationLoading}
                style={{ width: '48%' }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleVerifyOTP}
                disabled={verificationLoading || otpCode.length !== 6}
                style={{ width: '48%' }}
              >
                {verificationLoading ? <div className="spinner-small"></div> : 'Verify Code'}
              </Button>
            </div>

            <div className="otp-resend-container">
              <p>Didn't receive code?</p>

              <button
                onClick={() => startVerification(verifyingType)}
                disabled={verificationLoading || (verifyingType === 'email' && resendCooldown > 0)}
                className="resend-btn"
                style={{
                  color:
                    verifyingType === 'email' && resendCooldown > 0
                      ? '#64748b'
                      : 'var(--color-primary)',
                  cursor:
                    verifyingType === 'email' && resendCooldown > 0
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {verifyingType === 'email' && resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="sidebar-header">
              <h2>My Account</h2>
            </div>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <User size={20} />
                <span>Overview</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <Settings size={20} />
                <span>Personal Info</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} />
                <span>Orders</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <Bell size={20} />
                <span>Preferences</span>
              </button>
            </nav>

            <div className="sidebar-footer">
              <Button
                variant="ghost"
                className="logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          <div className="profile-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'preferences' && renderPreferences()}
          </div>
        </div>
      </div>

      {renderVerificationModal()}

      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '420px',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <LogOut size={32} color="#dc2626" />
            </div>

            <h2
              style={{
                marginBottom: '0.8rem',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            >
              Logout Confirmation
            </h2>

            <p
              style={{
                color: '#64748b',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              Are you sure you want to logout from your account?
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>

              <Button
                style={{
                  flex: 1,
                  background: '#dc2626',
                  borderColor: '#dc2626',
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;