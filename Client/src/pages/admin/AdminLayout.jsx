import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  Tag, 
  Ticket, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';
import logo from '../../assets/whiteocean.png';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin Master');
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check
  useEffect(() => {
    const adminToken = localStorage.getItem('whiteocean_admin_token');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('whiteocean_admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', name: 'Users', icon: Users },
    { path: '/admin/vendors', name: 'Vendors', icon: Store },
    { path: '/admin/products', name: 'Products', icon: ShoppingBag },
    { path: '/admin/orders', name: 'Orders', icon: UserCheck },
    { path: '/admin/categories', name: 'Categories', icon: Tag },
    { path: '/admin/coupons', name: 'Coupons', icon: Ticket },
    { path: '/admin/payments', name: 'Payments', icon: DollarSign },
    { path: '/admin/notifications', name: 'Notifications', icon: Bell },
    { path: '/admin/settings', name: 'Settings', icon: Settings },
  ];

  // Map pathnames to beautiful human titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/user/')) return 'User Profile Details';
    if (path.includes('/vendors')) return 'Vendor Partners';
    if (path.includes('/vendor/')) return 'Vendor Details';
    if (path.includes('/products')) return 'Product Catalog';
    if (path.includes('/product/')) return 'Product Inventory Details';
    if (path.includes('/orders')) return 'Order Registry';
    if (path.includes('/order/')) return 'Order Fulfillment Invoice';
    if (path.includes('/categories')) return 'Product Categories';
    if (path.includes('/coupons')) return 'Campaign Coupons';
    { if (path.includes('/payments')) return 'Payment Receipts'; }
    if (path.includes('/notifications')) return 'Push Bulletins';
    if (path.includes('/settings')) return 'Global Configurations';
    return 'Admin Deck';
  };

  return (
    <div className="admin-workspace">
      {/* Sidebar navigation */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img className="admin-sidebar-logo" src={logo} alt="White Ocean Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span className="admin-sidebar-brand-text">White Ocean</span>
          <button 
            className="admin-modal-close-btn" 
            style={{ marginLeft: 'auto', display: 'none' }} /* visible on mobile if needed, but handled by menu icon */
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Frame content */}
      <div className="admin-frame">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="admin-btn admin-btn-secondary admin-btn-icon" 
              style={{ display: 'none' }} /* Controlled by CSS media queries or toggle in React */
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Real menu toggle for mobile */}
            <span className="mobile-toggle-wrapper" style={{ display: 'inline-flex' }}>
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'inherit', 
                  cursor: 'pointer',
                  marginRight: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                className="admin-mobile-menu-btn"
              >
                <Menu size={24} className="admin-hamburger" />
              </button>
            </span>

            <h1 className="admin-topbar-title">{getPageTitle()}</h1>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-topbar-profile">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                alt="Avatar" 
                className="admin-topbar-avatar"
              />
              <span className="admin-topbar-name">{adminName}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* Mobile responsive toggle CSS patch */}
      <style>{`
        @media (min-width: 769px) {
          .admin-mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .admin-mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
