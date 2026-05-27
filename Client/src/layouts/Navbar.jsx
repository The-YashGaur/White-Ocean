import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import logo from '../assets/whiteocean.png';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cartItems, setCartOwner, getCartCount } = useCartStore();

  const navigate = useNavigate();

  useEffect(() => {
    const userId = user?._id || user?.id || user?.email || null;
    setCartOwner(userId);
  }, [user, setCartOwner]);

  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    setCartOwner(null);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
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
          <Link to="/vendor/dashboard" className="nav-link">Vendor Dashboard</Link>
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

              <Link to="/vendor/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                Vendor Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;