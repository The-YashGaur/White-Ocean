import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  Check, 
  XSquare, 
  Eye, 
  Star,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import './AdminLayout.css';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setVendors(getAdminData('vendors') || []);
  }, []);

  // Filter and search logic
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Adjust Vendor Status
  const handleUpdateStatus = (vendorId, nextStatus) => {
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return { ...v, status: nextStatus };
      }
      return v;
    });
    setVendors(updatedVendors);
    setAdminData('vendors', updatedVendors);
  };

  return (
    <div>
      {/* Search & Filter Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search vendors by company name, email..." 
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
            <option value="All">All Partners</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending Queue</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Table panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">E-Commerce Vendor Partners ({filteredVendors.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Details</th>
                <th>Satisfaction Rating</th>
                <th>Product Sales</th>
                <th>Verification State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="admin-cell-avatar">
                        <img 
                          src={v.image} 
                          alt={v.name} 
                          className="admin-table-avatar"
                          style={{ borderRadius: '12px' }}
                        />
                        <div>
                          <div className="admin-cell-title">{v.name}</div>
                          <div className="admin-cell-subtitle">ID: {v.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{v.email}</div>
                      <div className="admin-cell-subtitle">{v.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <Star size={16} fill="var(--admin-color-warning)" stroke="var(--admin-color-warning)" />
                        <span>{v.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.ordersCount} Sales</div>
                      <div className="admin-cell-subtitle" style={{ color: 'var(--admin-color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <TrendingUp size={12} />
                        <span>${v.salesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${v.status.toLowerCase()}`}>
                        {v.status === 'Pending' ? 'Pending Approval' : v.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/admin/vendor/${v.id}`} 
                          className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                          title="View Vendor Catalog & Files"
                        >
                          <Eye size={16} />
                        </Link>
                        
                        {v.status !== 'Approved' && (
                          <button 
                            className="admin-btn admin-btn-primary admin-btn-sm admin-btn-icon"
                            style={{ backgroundColor: 'var(--admin-color-success)' }}
                            onClick={() => handleUpdateStatus(v.id, 'Approved')}
                            title="Approve Partner"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        {v.status !== 'Suspended' && (
                          <button 
                            className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                            onClick={() => handleUpdateStatus(v.id, 'Suspended')}
                            title="Suspend Partner Operations"
                          >
                            <XSquare size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching vendor records found in the registry.</span>
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

export default AdminVendors;
