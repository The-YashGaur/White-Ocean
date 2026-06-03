import React, { useState, useEffect } from 'react';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  Plus, 
  Trash2, 
  Bell, 
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  AlertTriangle,
  Gift,
  X
} from 'lucide-react';
import './AdminLayout.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    type: 'promotional',
    status: 'Active'
  });

  useEffect(() => {
    setNotifications(getAdminData('notifications') || []);

    const handleUpdate = () => {
      setNotifications(getAdminData('notifications') || []);
    };
    window.addEventListener('adminDataUpdated', handleUpdate);
    return () => window.removeEventListener('adminDataUpdated', handleUpdate);
  }, []);

  const filteredNotices = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle Active/Expired status
  const toggleStatus = (id) => {
    const updated = notifications.map(n => {
      if (n._id === id || n.id === id) {
        return { ...n, status: n.status === 'Active' ? 'Expired' : 'Active' };
      }
      return n;
    });
    setNotifications(updated);
    setAdminData('notifications', updated);
  };

  const handleDelete = (id) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this bulletin?");
    if (!confirm) return;

    const updated = notifications.filter(n => n._id !== id && n.id !== id);
    setNotifications(updated);
    setAdminData('notifications', updated);
  };

  const handleSaveNotice = (e) => {
    e.preventDefault();
    const notice = {
      ...newNotice,
      _id: 'mock_' + Date.now(),
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [notice, ...notifications];
    setNotifications(updated);
    setAdminData('notifications', updated);
    setShowModal(false);
    setNewNotice({
      title: '',
      message: '',
      type: 'promotional',
      status: 'Active'
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={20} style={{ color: 'var(--admin-color-danger)' }} />;
      case 'offer': return <Gift size={20} style={{ color: 'var(--admin-color-success)' }} />;
      default: return <Megaphone size={20} style={{ color: 'var(--admin-color-primary)' }} />;
    }
  };

  return (
    <div>
      {/* Search Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search bulletins by title, message content..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Launch Bulletin</span>
          </button>
        </div>
      </div>

      {/* Main Bulletins List panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Active Platform & Push Bulletins ({filteredNotices.length})</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredNotices.length > 0 ? (
            filteredNotices.map((n) => (
              <div 
                key={n._id || n.id}
                style={{ 
                  display: 'flex', 
                  gap: '1.25rem', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid var(--admin-border-color)',
                  backgroundColor: n.status === 'Expired' ? 'var(--admin-color-light-alt)' : '#fff',
                  opacity: n.status === 'Expired' ? 0.75 : 1
                }}
              >
                <div style={{ 
                  padding: '0.75rem', 
                  borderRadius: '12px', 
                  backgroundColor: n.type === 'alert' ? 'rgba(239, 68, 68, 0.1)' : n.type === 'offer' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 174, 239, 0.1)',
                  height: 'fit-content'
                }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-color-dark)' }}>{n.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`admin-badge ${n.type.toLowerCase()}-glow`} style={{ textTransform: 'uppercase', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>{n.type}</span>
                      <span className={`admin-badge ${n.status === 'Active' ? 'active' : 'blocked'}`}>{n.status}</span>
                    </div>
                  </div>

                  <p style={{ margin: 0, color: '#475569', fontSize: '0.925rem', lineHeight: 1.5 }}>{n.message}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    <Calendar size={14} />
                    <span>Sent: {new Date(n.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: n.status === 'Active' ? 'var(--admin-color-success)' : '#94a3b8' }}
                    onClick={() => toggleStatus(n._id || n.id)}
                    title={n.status === 'Active' ? 'Mark Expired' : 'Mark Active'}
                  >
                    {n.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>

                  <button 
                    className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                    onClick={() => handleDelete(n._id || n.id)}
                    title="Purge Bulletin"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', border: '1px solid var(--admin-border-color)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                <span>No push bulletins or notifications scheduled yet.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal Popup */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Publish Promotional or Alert Bulletin</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNotice}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="noticeTitle">Bulletin Heading</label>
                  <input 
                    id="noticeTitle"
                    type="text" 
                    placeholder="e.g. Free Delivery Weekend!"
                    className="admin-form-input"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="noticeType">Bulletin Classification</label>
                  <select 
                    id="noticeType"
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                  >
                    <option value="promotional">Promotional Bulletin</option>
                    <option value="alert">System Maintenance / Alert</option>
                    <option value="offer">Discount Campaign Offer</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="noticeMsg">Bulletin Text Message</label>
                  <textarea 
                    id="noticeMsg"
                    placeholder="Enter the complete bulletin message content to push to portal users..."
                    className="admin-form-textarea"
                    value={newNotice.message}
                    onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Push Bulletin Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
