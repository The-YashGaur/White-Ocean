import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const Privacy = () => {
  return (
    <div className="privacy-page py-16" style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', lineHeight: 1.7 }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" className="admin-btn admin-btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
            <Shield size={36} style={{ color: 'var(--color-primary)' }} />
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>Privacy Policy</h1>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>Last updated: May 28, 2026</p>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>1. Information We Collect</h3>
            <p>
              We collect necessary personal credentials such as your first name, last name, verified email address, phone number, and physical shipping address to fulfill order checkouts, send security OTP codes, and maintain secure session tokens.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>2. Data Encrypting & Cookies</h3>
            <p>
              Session details are securely preserved using HttpOnly JWT cookies to shield you from cross-site scripting (XSS) or request forgery. Payments information entered at checkout is processed securely using authorized protocols.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>3. How We Use Vendor Data</h3>
            <p>
              Vendor partner details, including storefront brand names, ratings, active inventories, and sales totals are shared on the public directory to facilitate orders checkout. Internal contact coordinates remain strictly protected.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>4. Data Deletion Rights</h3>
            <p>
              Registries and customer profiles can be fully purged upon request or manual administrator expunging. Once an account is expunged, associated session credentials and profile states are permanently deleted.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
