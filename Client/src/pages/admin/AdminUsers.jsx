import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Trash2, 
  Eye, 
  UserPlus,
  AlertCircle
} from 'lucide-react';
import './AdminLayout.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    setUsers(getAdminData('users') || []);
  }, []);

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const phone = user.phone ? user.phone.toLowerCase() : '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          email.includes(searchTerm.toLowerCase()) ||
                          phone.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' ? true : user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Block/Unblock status toggle
  const toggleBlockStatus = (userId) => {
    const updatedUsers = users.map(user => {
      if (user._id === userId) {
        const nextStatus = user.status === 'Active' ? 'Blocked' : 'Active';
        return { ...user, status: nextStatus };
      }
      return user;
    });
    setUsers(updatedUsers);
    setAdminData('users', updatedUsers);
  };

  // Trigger delete workflow
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    const updatedUsers = users.filter(user => user._id !== userToDelete._id);
    setUsers(updatedUsers);
    setAdminData('users', updatedUsers);
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <div>
      {/* Search & Filter Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name, email, phone..." 
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
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Main Users Table panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Registered Customer Base ({filteredUsers.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th>Contact Info</th>
                <th>Join Date</th>
                <th>Shopping Metrics</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-cell-avatar">
                        <img 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.firstName}${user.lastName}`} 
                          alt="User avatar" 
                          className="admin-table-avatar"
                          style={{ backgroundColor: '#f1f5f9' }}
                        />
                        <div>
                          <div className="admin-cell-title">{user.firstName} {user.lastName}</div>
                          <div className="admin-cell-subtitle">ID: {user._id.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.email}</div>
                      <div className="admin-cell-subtitle">{user.phone}</div>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{user.totalOrders} Orders</div>
                      <div className="admin-cell-subtitle" style={{ color: 'var(--admin-color-primary)', fontWeight: 600 }}>
                        ${user.totalSpent.toFixed(2)} spent
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link 
                          to={`/admin/user/${user._id}`} 
                          className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                          title="View detailed profiles"
                        >
                          <Eye size={16} />
                        </Link>
                        
                        <button 
                          className={`admin-btn admin-btn-sm admin-btn-icon ${user.status === 'Active' ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                          style={{ color: user.status === 'Active' ? 'var(--admin-color-warning)' : '' }}
                          onClick={() => toggleBlockStatus(user._id)}
                          title={user.status === 'Active' ? 'Block User account' : 'Unblock User account'}
                        >
                          {user.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>

                        <button 
                          className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                          onClick={() => handleDeleteClick(user)}
                          title="Delete User permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching customer records found in the registry.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal Popup */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Revoke Portal Access</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div className="bg-danger-glow" style={{ padding: '0.75rem', borderRadius: '12px', color: 'var(--admin-color-danger)' }}>
                  <Trash2 size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: 'var(--admin-color-dark)' }}>Confirm Permanent Deletion?</p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Are you absolutely sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>? This customer's profile, transaction counts, and registry metrics will be wiped permanently.
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="admin-btn" style={{ backgroundColor: 'var(--admin-color-danger)', color: '#fff' }} onClick={confirmDelete}>Wipe Registry Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
