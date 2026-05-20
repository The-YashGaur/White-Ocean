import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  DollarSign, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  AlertCircle
} from 'lucide-react';
import './AdminLayout.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPayments(getAdminData('payments') || []);
  }, []);

  const filteredPayments = payments.filter(p => 
    (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.orderId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trigger Refund
  const handleRefund = (payId) => {
    const confirm = window.confirm("Are you sure you want to execute a full reversal refund of this transaction?");
    if (!confirm) return;

    const updated = payments.map(p => {
      if (p.id === payId) {
        return { ...p, status: 'Refunded' };
      }
      return p;
    });
    setPayments(updated);
    setAdminData('payments', updated);
  };

  // Calculations
  const totalSettled = payments
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeCount = payments.filter(p => p.status === 'Success').length;
  const refundCount = payments.filter(p => p.status === 'Refunded').length;

  return (
    <div>
      {/* Visual summary metrics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Gross Funds Settled</span>
            <span className="admin-stat-value">${totalSettled.toFixed(2)}</span>
          </div>
          <div className="admin-stat-icon-box bg-success-glow">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Active Receipts</span>
            <span className="admin-stat-value">{activeCount} Transactions</span>
          </div>
          <div className="admin-stat-icon-box bg-primary-glow">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Total Funds Refunded</span>
            <span className="admin-stat-value">${totalRefunded.toFixed(2)}</span>
          </div>
          <div className="admin-stat-icon-box bg-danger-glow">
            <RotateCcw size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Refund Logs</span>
            <span className="admin-stat-value">{refundCount} Reversals</span>
          </div>
          <div className="admin-stat-icon-box bg-warning-glow">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search payments by Transaction ID, Customer, Order ID..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Ledger panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Administrative Payment Ledger ({filteredPayments.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Receipt / Transaction ID</th>
                <th>Purchased Date</th>
                <th>Order Ref</th>
                <th>Customer Entity</th>
                <th>Settled Amount</th>
                <th>Protocol</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="admin-cell-title" style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      {p.id}
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <Link to={`/admin/order/${p.orderId}`} style={{ color: 'var(--admin-color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                        {p.orderId.toUpperCase()}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{p.customer}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      ${p.amount.toFixed(2)}
                    </td>
                    <td style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>{p.paymentMethod}</td>
                    <td>
                      <span className={`admin-badge ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'Success' ? (
                        <button 
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          style={{ padding: '0.35rem 0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                          onClick={() => handleRefund(p.id)}
                        >
                          <RotateCcw size={12} />
                          <span>Refund</span>
                        </button>
                      ) : (
                        <span className="admin-cell-subtitle" style={{ fontWeight: 600 }}>Settled Reversal</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching transaction receipts found in the ledger.</span>
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

export default AdminPayments;
