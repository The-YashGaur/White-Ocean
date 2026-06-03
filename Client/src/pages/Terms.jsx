import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const Terms = () => {
  return (
    <div className="terms-page py-16" style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', lineHeight: 1.7 }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" className="admin-btn admin-btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
            <FileText size={36} style={{ color: 'var(--color-primary)' }} />
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>Terms of Service</h1>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>Last updated: May 28, 2026</p>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>1. Agreement to Terms</h3>
            <p>
              By accessing or using the White Ocean multi-vendor platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the website or services.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>2. User Registrations</h3>
            <p>
              To shop or register as a merchant partner, you must provide valid credentials, including a valid email address and phone number verified via our Secure OTP protocol. You are solely responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>3. Multi-Vendor Platform Rules</h3>
            <p>
              White Ocean acts as a connecting facilitator between buyers and independent vendors. Product quality, stock listings, description accuracy, and shipping timelines are the direct responsibility of the respective seller.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>4. Billing, Promo Codes & Reversals</h3>
            <p>
              Promo codes and coupons must be entered at checkout. Taxes and delivery rates are dynamically aggregated. Refunds and payment ledger reversals are processed according to our administrative merchant policy.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>5. Limitation of Liability</h3>
            <p>
              In no event shall White Ocean, its parent company, or affiliates be liable for direct, indirect, incidental, or consequential damages resulting from the transactions between buyers and vendor merchants.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
