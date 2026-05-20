import React, { useState, useEffect } from 'react';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  Plus, 
  Trash2, 
  Ticket, 
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import './AdminLayout.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal/Drawer state
  const [showFormModal, setShowFormModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 100,
    usageLimit: 100,
    usedCount: 0,
    expiryDate: '2026-12-31'
  });

  useEffect(() => {
    setCoupons(getAdminData('coupons') || []);
  }, []);

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (couponId) => {
    const confirm = window.confirm("Are you sure you want to deactivate and remove this coupon code?");
    if (!confirm) return;

    const updated = coupons.filter(c => c.id !== couponId);
    setCoupons(updated);
    setAdminData('coupons', updated);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    const createdCoupon = {
      ...newCoupon,
      id: Date.now(),
      discountValue: parseFloat(newCoupon.discountValue),
      minOrderAmount: parseFloat(newCoupon.minOrderAmount),
      usageLimit: parseInt(newCoupon.usageLimit)
    };
    
    const updated = [...coupons, createdCoupon];
    setCoupons(updated);
    setAdminData('coupons', updated);
    setShowFormModal(false);
    // Reset state
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 100,
      usageLimit: 100,
      usedCount: 0,
      expiryDate: '2026-12-31'
    });
  };

  return (
    <div>
      {/* Search Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search coupons by code..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowFormModal(true)}>
            <Plus size={16} />
            <span>Generate Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons Panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Active Discount Promotional Coupons ({filteredCoupons.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Details</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Usage Threshold</th>
                <th>Expiration Bounds</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  const isExceeded = c.usedCount >= c.usageLimit;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="bg-primary-glow" style={{ padding: '0.6rem', borderRadius: '10px' }}>
                            <Ticket size={20} />
                          </div>
                          <div>
                            <div className="admin-cell-title" style={{ fontFamily: 'monospace', letterSpacing: '0.5px', fontSize: '1rem', color: 'var(--admin-color-primary)' }}>{c.code}</div>
                            <div className="admin-cell-subtitle">Ref ID: {c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {c.discountType === 'percentage' ? 'Percentage Off' : 'Flat Cash Discount'}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.usedCount} / {c.usageLimit} claims used</div>
                        <div className="admin-cell-subtitle">Min Order: ${c.minOrderAmount}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                          <Calendar size={14} style={{ color: '#64748b' }} />
                          <span style={{ color: isExpired ? 'var(--admin-color-danger)' : 'inherit' }}>
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        {isExpired && <span className="admin-badge failed" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginTop: '0.15rem' }}>Expired Code</span>}
                        {isExceeded && <span className="admin-badge failed" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginTop: '0.15rem' }}>Limit Exceeded</span>}
                      </td>
                      <td>
                        <button 
                          className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                          onClick={() => handleDeleteClick(c.id)}
                          title="Purge Coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching promotional coupons found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Coupon Popup Form Modal */}
      {showFormModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Generate Discount Campaign Key</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowFormModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupCode">Coupon Promotion Code</label>
                  <input 
                    id="coupCode"
                    type="text" 
                    placeholder="e.g. GET30, SPECIALFALL"
                    className="admin-form-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.5px' }}
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="admin-settings-row" style={{ marginBottom: 0 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="coupType">Reduction Protocol</label>
                    <select 
                      id="coupType"
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={newCoupon.discountType}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage Deduct</option>
                      <option value="flat">Flat Value Cash</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="coupVal">Discount Value</label>
                    <input 
                      id="coupVal"
                      type="number" 
                      min="1"
                      className="admin-form-input"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-settings-row" style={{ marginBottom: 0 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="coupMin">Min order threshold ($)</label>
                    <input 
                      id="coupMin"
                      type="number" 
                      min="0"
                      className="admin-form-input"
                      value={newCoupon.minOrderAmount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="coupLimit">Global claim cap</label>
                    <input 
                      id="coupLimit"
                      type="number" 
                      min="1"
                      className="admin-form-input"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="coupExpiry">Coupon Expiry Date</label>
                  <input 
                    id="coupExpiry"
                    type="date" 
                    className="admin-form-input"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Generate Promo Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
