import React from 'react';
import { Link } from 'react-router-dom';
import {  Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col">
            <Link to="/" className="footer-logo">
              White<span className="text-primary">Ocean</span>
            </Link>
            <p className="footer-tagline">"Freshness Delivered Daily"</p>
            <p className="footer-desc">
              Your premium destination for farm-fresh groceries, organic produce, and everyday essentials.
            </p>
            <div className="social-links">
              {/* <a href="#" className="social-link"><Facebook size={20} /></a> */}
              <a href="#" className="social-link"><Twitter size={20} /></a>
              <a href="#" className="social-link"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop</Link></li>
              <li><Link to="/vendors">Vendors</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-links">
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/orders">Order History</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={18} className="text-primary" />
                <span>123 Ocean Drive, Fresh City, FC 90210</span>
              </li>
              <li>
                <Phone size={18} className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <Mail size={18} className="text-primary" />
                <span>support@whiteocean.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} WhiteOcean. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
