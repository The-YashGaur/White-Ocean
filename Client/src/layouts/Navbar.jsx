import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import logo from '../assets/whiteocean.png';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useProductStore from '../store/productStore';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cartItems, setCartOwner, getCartCount } = useCartStore();
  const { fetchAnnouncements } = useProductStore();

  const [announcements, setAnnouncements] = useState([]);
  const [currentNotifIndex, setCurrentNotifIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = user?._id || user?.id || user?.email || null;
    setCartOwner(userId);
  }, [user, setCartOwner]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      const list = await fetchAnnouncements();
      if (list && list.length > 0) {
        setAnnouncements(list);
      }
    };
    loadAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNotifIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements]);

  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    setCartOwner(null);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {announcements.length > 0 && (
        <div className="navbar-announcement-bar">
          <span className="announcement-badge-text">{announcements[currentNotifIndex].type || 'PROMO'}</span>
          <span className="announcement-message">{announcements[currentNotifIndex].message}</span>
        </div>
      )}
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="WhiteOcean Logo" className="navbar-logo-img" />
          <span className="navbar-logo-text">
            White<span className="text-primary">Ocean</span>
          </span>
        </Link>

        {/* <div className="navbar-search hidden-mobile">
          <input type="text" placeholder="Search for groceries..." className="search-input" />
          <button className="search-btn">
            <Search size={18} />
          </button>
        </div> */}

        <div className="navbar-links hidden-mobile">
          <Link to="/products" className="nav-link">Shop</Link>
          <Link to="/vendors" className="nav-link">Vendors</Link>
          
          {isAuthenticated && user?.role === 'vendor' && (
            <Link to="/vendor/dashboard" className="nav-link">Vendor Dashboard</Link>
          )}

          {isAuthenticated && user?.role === 'customer' && !user?.vendorApplication?.isApplied && (
            <Link to="/become-vendor" className="nav-link become-vendor">Become a Vendor</Link>
          )}

          {isAuthenticated && user?.role === 'customer' && user?.vendorApplication?.isApplied && (
            <Link to="/become-vendor" className="nav-link app-pending">Application Pending</Link>
          )}
        </div>

        <div className="navbar-icons">
          {isAuthenticated ? (
            <div className="user-menu hidden-mobile">
              <Link to="/profile" className="user-profile">
                <img
                  src={
                    user?.profileImage
                      ? user.profileImage.startsWith('/uploads')
                        ? `http://localhost:8000${user.profileImage}`
                        : user.profileImage
                      : `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}+${user?.lastName || ''}&background=random`
                  }
                  alt={user?.firstName}
                  className="user-avatar"
                />
                <span className="user-name">{user?.firstName}</span>
              </Link>

              {/* <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button> */}
            </div>
          ) : (
            <>
              <Link to="/login" className="icon-btn hidden-mobile">
                <User size={22} />
              </Link>

              <Link to="/register" className="btn btn-primary btn-sm hidden-mobile">
                Sign Up
              </Link>
            </>
          )}

          <Link to="/cart" className="icon-btn cart-btn">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <button
            className="icon-btn mobile-menu-btn hidden-desktop"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="container">
            <div className="navbar-search mobile-search">
              <input type="text" placeholder="Search for groceries..." className="search-input" />
              <button className="search-btn">
                <Search size={18} />
              </button>
            </div>

            <div className="mobile-links">
              <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              <Link to="/vendors" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Vendors</Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                  <button className="mobile-link logout-mobile" onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                </>
              )}

              <Link to="/cart" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Cart ({cartCount})
              </Link>

              {isAuthenticated && user?.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Vendor Dashboard
                </Link>
              )}

              {isAuthenticated && user?.role === 'customer' && !user?.vendorApplication?.isApplied && (
                <Link to="/become-vendor" className="mobile-link become-vendor" onClick={() => setIsMobileMenuOpen(false)}>
                  Become a Vendor
                </Link>
              )}

              {isAuthenticated && user?.role === 'customer' && user?.vendorApplication?.isApplied && (
                <Link to="/become-vendor" className="mobile-link app-pending" onClick={() => setIsMobileMenuOpen(false)}>
                  Application Pending
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;