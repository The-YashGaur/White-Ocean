import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { API_BASE_URL } from '../../config';
import { 
  Search, 
  Eye, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck
} from 'lucide-react';
import './AdminLayout.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Directly fetch fresh orders from backend on every mount
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem('whiteocean_admin_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token && !token.startsWith('mock_')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
          headers,
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
          localStorage.setItem('whiteocean_admin_orders', JSON.stringify(data.data));
        }
      } catch (err) {
        // Fallback to cache if network fails
        setOrders(getAdminData('orders') || []);
      }
    };

    loadOrders();

    const handleUpdate = () => {
      setOrders(getAdminData('orders') || []);
    };
    window.addEventListener('adminDataUpdated', handleUpdate);
    return () => window.removeEventListener('adminDataUpdated', handleUpdate);
  }, []);

  // Filter and search logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerSnapshot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // State Transition Machine (Placed -> Processing -> Packed -> Out for Delivery -> Delivered)
  const advanceOrderStatus = (orderId, currentStatus) => {
    let nextStatus;
    switch(currentStatus) {
      case 'Placed': nextStatus = 'Processing'; break;
      case 'Processing': nextStatus = 'Packed'; break;
      case 'Packed': nextStatus = 'Out for Delivery'; break;
      case 'Out for Delivery': nextStatus = 'Delivered'; break;
      default: return; // already Delivered or Cancelled
    }

    const updated = orders.map(o => {
      if (o._id === orderId) {
        // Automatically set payment status to 'Paid' if order is delivered
        const updatedPaymentStatus = nextStatus === 'Delivered' ? 'Paid' : o.paymentStatus;
        return { ...o, orderStatus: nextStatus, paymentStatus: updatedPaymentStatus };
      }
      return o;
    });

    setOrders(updated);
    setAdminData('orders', updated);
  };

  // Cancel order trigger
  const cancelOrder = (orderId) => {
    const updated = orders.map(o => {
      if (o._id === orderId) {
        return { ...o, orderStatus: 'Cancelled' };
      }
      return o;
    });
    setOrders(updated);
    setAdminData('orders', updated);
  };

  return (
    <div>
      {/* Search & Filter Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search orders by Order ID, Customer name..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-actions">
          <select 
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Deliveries</option>
            <option value="Placed">Placed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Order Fulfillment Registries ({filteredOrders.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Purchased Date</th>
                <th>Customer Snapshot</th>
                <th>Total Bill</th>
                <th>Fulfillment</th>
                <th>Payment</th>
                <th>State Transitions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const canAdvance = ['Placed', 'Processing', 'Packed', 'Out for Delivery'].includes(o.orderStatus);
                  return (
                    <tr key={o._id}>
                      <td className="admin-cell-title">
                        <Link to={`/admin/order/${o._id}`} style={{ color: 'var(--admin-color-primary)', textDecoration: 'none' }}>
                          {o._id.toUpperCase()}
                        </Link>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customerSnapshot.name}</div>
                        <div className="admin-cell-subtitle">{o.customerSnapshot.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>${o.totalPrice.toFixed(2)}</div>
                        <div className="admin-cell-subtitle" style={{ textTransform: 'uppercase' }}>{o.paymentMethod}</div>
                      </td>
                      <td>
                        <span className={`admin-badge ${o.orderStatus.toLowerCase()}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${o.paymentStatus.toLowerCase()}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        {canAdvance ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-primary" 
                              style={{ padding: '0.35rem 0.65rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                              onClick={() => advanceOrderStatus(o._id, o.orderStatus)}
                            >
                              <span>Next State</span>
                              <ArrowRight size={12} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              style={{ padding: '0.35rem' }}
                              onClick={() => cancelOrder(o._id)}
                              title="Cancel Order delivery"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="admin-cell-subtitle" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fulfillment Cycle Ended</span>
                        )}
                      </td>
                      <td>
                        <Link 
                          to={`/admin/order/${o._id}`}
                          className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                          title="Generate Invoice & Details"
                        >
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching order receipts found in the registry.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
