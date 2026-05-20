import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  ArrowLeft, 
  UserX, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  ShoppingBag,
  DollarSign,
  FileText
} from 'lucide-react';
import './AdminLayout.css';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const allUsers = getAdminData('users') || [];
    const foundUser = allUsers.find(u => u._id === id);
    if (!foundUser) {
      navigate('/admin/users');
      return;
    }
    setUser(foundUser);

    const allOrders = getAdminData('orders') || [];
    // Filter orders belonging to this user
    const userOrders = allOrders.filter(o => o.customerSnapshot.email === foundUser.email);
    setOrders(userOrders);
  }, [id, navigate]);

  const toggleBlockStatus = () => {
    if (!user) return;
    const nextStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    const allUsers = getAdminData('users') || [];
    const updatedUsers = allUsers.map(u => {
      if (u._id === user._id) {
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setAdminData('users', updatedUsers);
    setUser({ ...user, status: nextStatus });
  };

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading customer details...</div>;
  }

  return (
    <div>
      {/* Back Header Nav */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/users" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </Link>

        <button 
          className={`admin-btn ${user.status === 'Active' ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
          style={{ color: user.status === 'Active' ? 'var(--admin-color-warning)' : '' }}
          onClick={toggleBlockStatus}
        >
          {user.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
          <span>{user.status === 'Active' ? 'Block Account' : 'Unblock Account'}</span>
        </button>
      </div>

      {/* Main Profile Grid */}
      <div className="admin-profile-grid">
        {/* Left Side: Avatar Card */}
        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content' }}>
          <div className="admin-profile-sidebar">
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.firstName}${user.lastName}`} 
              alt="Avatar" 
              className="admin-profile-sidebar-img"
              style={{ backgroundColor: '#f1f5f9' }}
            />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>{user.firstName} {user.lastName}</h2>
              <span className={`admin-badge ${user.status.toLowerCase()}`}>{user.status}</span>
            </div>
            
            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--admin-border-color)', margin: '1rem 0' }}></div>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <MapPin size={16} />
                <span style={{ wordBreak: 'break-all' }}>{user.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Account Details & Purchase History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Account metrics & info */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Customer Dossier Details</h3>
            </div>

            <div className="admin-profile-details">
              <div className="admin-detail-item">
                <span className="admin-detail-label">First Name</span>
                <span className="admin-detail-value">{user.firstName}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Last Name</span>
                <span className="admin-detail-value">{user.lastName}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Email Address</span>
                <span className="admin-detail-value">{user.email}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Phone Number</span>
                <span className="admin-detail-value">{user.phone}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Total Transactions</span>
                <span className="admin-detail-value-large" style={{ color: 'var(--admin-color-dark)' }}>{user.totalOrders} Orders</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Total Funds Expended</span>
                <span className="admin-detail-value-large">${user.totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* User's Order List */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Order Fulfillment History ({orders.length})</h3>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Item Summary</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((o) => (
                      <tr key={o._id}>
                        <td className="admin-cell-title">
                          <Link to={`/admin/order/${o._id}`} style={{ color: 'var(--admin-color-primary)', textDecoration: 'none' }}>
                            {o._id.toUpperCase()}
                          </Link>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>
                            {o.orderItems.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>${o.totalPrice.toFixed(2)}</td>
                        <td>
                          <span className={`admin-badge ${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span>
                        </td>
                        <td>
                          <span className={`admin-badge ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No orders recorded for this customer in the portal yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
