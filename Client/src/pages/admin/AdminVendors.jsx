import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Check, 
  XSquare, 
  Eye, 
  Star,
  AlertCircle,
  TrendingUp,
  Inbox,
  Building,
  Mail,
  Phone,
  Clock,
  Loader,
  ExternalLink
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './AdminLayout.css';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'pending'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all vendors & applications from backend
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch approved vendors
      const resVendors = await fetch(`${API_BASE_URL}/api/admin/vendors`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const dataVendors = await resVendors.json();
      if (dataVendors.success) {
        setVendors(dataVendors.data);
      } else {
        throw new Error(dataVendors.error || 'Failed to fetch vendor registry.');
      }

      // 2. Fetch pending onboarding requests
      const resApps = await fetch(`${API_BASE_URL}/api/admin/vendors/applications`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const dataApps = await resApps.json();
      if (dataApps.success) {
        setApplications(dataApps.data);
      } else {
        throw new Error(dataApps.error || 'Failed to fetch pending review queue.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Error communicating with administration backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter approved partners
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (v.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter pending applications
  const filteredApplications = applications.filter(app => {
    const applicantName = `${app.firstName || ''} ${app.lastName || ''}`.toLowerCase();
    const matchesSearch = 
      applicantName.includes(searchTerm.toLowerCase()) || 
      (app.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.vendorApplication?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Promote customer to vendor
  const handleApproveApplication = async (userId, companyName) => {
    if (window.confirm(`Are you sure you want to approve ${companyName || 'this application'} and promote this user to a Certified Vendor?`)) {
      setActionLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/vendors/applications/${userId}/approve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
          setSuccessMsg(`Successfully approved & promoted "${companyName || 'Merchant'}" to WhiteOcean Vendor!`);
          await fetchData(); // Refresh state
        } else {
          setErrorMsg(result.error || 'Promotion request failed.');
        }
      } catch (error) {
        setErrorMsg('Network error. Failed to execute promotion workflow.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Suspend/Deactivate Vendor status
  const handleUpdateVendorStatus = async (vendorId, nextStatus) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await response.json();
      if (result.success) {
        setSuccessMsg(`Vendor status updated to ${nextStatus} successfully!`);
        await fetchData();
      } else {
        setErrorMsg(result.error || 'Failed to update status.');
      }
    } catch (error) {
      setErrorMsg('Network error updating vendor status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Toast Alert Banners */}
      {successMsg && (
        <div className="admin-alert success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600 }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="admin-alert danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 600 }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
          style={{ background: 'none', border: 'none', color: activeTab === 'approved' ? '#10b981' : '#64748b', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', paddingBottom: '0.75rem', borderBottom: activeTab === 'approved' ? '2px solid #10b981' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Approved Partners ({vendors.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
          style={{ background: 'none', border: 'none', color: activeTab === 'pending' ? '#f59e0b' : '#64748b', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', paddingBottom: '0.75rem', borderBottom: activeTab === 'pending' ? '2px solid #f59e0b' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Pending Applications ({applications.length})
          {applications.length > 0 && (
            <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: '#fff', borderRadius: '50px', padding: '0.15rem 0.5rem', fontWeight: 600 }}>NEW</span>
          )}
        </button>
      </div>

      {/* Search & Filter Header */}
      <div className="admin-filters-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder={activeTab === 'approved' ? "Search vendors by company name, email..." : "Search applications by name, email, store..."} 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'approved' && (
          <div className="admin-filter-actions">
            <select 
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Table panel */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: '#64748b' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="spinner"></div>
            <span>Fetching secure registry data...</span>
          </div>
        </div>
      ) : activeTab === 'approved' ? (
        /* ================= APPROVED PARTNERS WORKSPACE ================= */
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
                  filteredVendors.map((v) => {
                    const company = v.vendorApplication?.companyName || v.firstName + ' ' + v.lastName;
                    return (
                      <tr key={v._id}>
                        <td>
                          <div className="admin-cell-avatar">
                            <img 
                              src={v.profileImage || 'https://images.unsplash.com/photo-1595853035070-59a39fe84dd3?auto=format&fit=crop&w=200&q=80'} 
                              alt={company} 
                              className="admin-table-avatar"
                              style={{ borderRadius: '12px' }}
                            />
                            <div>
                              <div className="admin-cell-title">{company}</div>
                              <div className="admin-cell-subtitle">ID: {v._id.toUpperCase()}</div>
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
                            <span>{(v.rating || 4.8).toFixed(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.ordersCount || 0} Sales</div>
                          <div className="admin-cell-subtitle" style={{ color: 'var(--admin-color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <TrendingUp size={12} />
                            <span>${(v.salesAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${v.status?.toLowerCase() || 'approved'}`}>
                            {v.status || 'Approved'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link 
                              to={`/admin/vendor/${v._id}`} 
                              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                              title="View Vendor Details"
                            >
                              <Eye size={16} />
                            </Link>
                            
                            {v.status !== 'Approved' && (
                              <button 
                                className="admin-btn admin-btn-primary admin-btn-sm admin-btn-icon"
                                style={{ backgroundColor: 'var(--admin-color-success)' }}
                                onClick={() => handleUpdateVendorStatus(v._id, 'Approved')}
                                disabled={actionLoading}
                                title="Approve/Reactivate Partner"
                              >
                                <Check size={16} />
                              </button>
                            )}

                            {v.status !== 'Suspended' && (
                              <button 
                                className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                                onClick={() => handleUpdateVendorStatus(v._id, 'Suspended')}
                                disabled={actionLoading}
                                title="Suspend Partner Operations"
                              >
                                <XSquare size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                        <span>No matching certified vendor partners found in the registry.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= PENDING APPLICATIONS REVIEW ================= */
        <div className="admin-panel">
          <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="admin-panel-title">Pending Merchant Registration Requests ({filteredApplications.length})</h2>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant Profile</th>
                  <th>Store / Brand Specification</th>
                  <th>Onboarding Segment</th>
                  <th>Contact Support Details</th>
                  <th>Applied On</th>
                  <th>Vetting Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => {
                    const applicant = `${app.firstName || ''} ${app.lastName || ''}`;
                    const details = app.vendorApplication || {};
                    return (
                      <tr key={app._id}>
                        <td>
                          <div className="admin-cell-avatar">
                            <img 
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${app.firstName}${app.lastName}`} 
                              alt={applicant} 
                              className="admin-table-avatar"
                              style={{ backgroundColor: '#f1f5f9' }}
                            />
                            <div>
                              <div className="admin-cell-title">{applicant}</div>
                              <div className="admin-cell-subtitle">Cust-ID: {app._id.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{details.companyName}</div>
                          {details.description && (
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b', maxWidth: '280px', lineBreak: 'anywhere', whiteSpace: 'normal', lineHeight: 1.4 }}>
                              {details.description.length > 120 ? `${details.description.substring(0, 120)}...` : details.description}
                            </p>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '50px', padding: '0.2rem 0.6rem', fontWeight: 600 }}>
                            {details.storeCategory || 'General'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                            <Mail size={12} style={{ color: '#64748b' }} />
                            <span>{details.supportEmail || app.email}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                            <Phone size={12} />
                            <span>{details.supportPhone || app.phone}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            <Clock size={12} style={{ color: '#64748b' }} />
                            <span>{details.appliedAt ? new Date(details.appliedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="admin-btn admin-btn-sm"
                              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}
                              onClick={() => handleApproveApplication(app._id, details.companyName)}
                              disabled={actionLoading}
                              title="Verify, Promoted & Authorize Catalog Control"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <Inbox size={40} style={{ color: '#475569' }} />
                        <span style={{ fontWeight: 600, color: '#475569' }}>Applications Inbox Clear!</span>
                        <span style={{ fontSize: '0.85rem' }}>No new merchant registrations are waiting for compliance review.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
