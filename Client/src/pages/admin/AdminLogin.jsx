import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle } from 'lucide-react';
import logo from '../../assets/whiteocean.png';
import './AdminLayout.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@whiteocean.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate short network delay for immersive UX
    setTimeout(() => {
      if (email === 'admin@whiteocean.com' && password === 'admin123') {
        localStorage.setItem('whiteocean_admin_token', 'mock_admin_token_abcdef123456');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Please double check.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img className="admin-login-logo" src={logo} alt="White Ocean Logo" style={{ height: '48px', width: 'auto', display: 'block', margin: '0 auto 1.25rem auto', objectFit: 'contain' }} />
          <h2 className="admin-login-title">Admin Console</h2>
          <p className="admin-login-subtitle">Sign in to govern the White Ocean portal</p>
        </div>

        {error && (
          <div className="bg-danger-glow" style={{ padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="email">Administrative Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                id="email"
                type="email" 
                className="admin-form-input" 
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="password">Security Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                id="password"
                type="password" 
                className="admin-form-input" 
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="admin-btn admin-btn-primary" 
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating Credentials...' : 'Access Command Panel'}
          </button>
        </form>

        <div className="admin-login-info-box">
          <strong style={{ display: 'block', color: 'var(--admin-color-dark)', marginBottom: '0.25rem' }}>Security Note:</strong>
          Use the following preloaded keys to evaluate administrative features:
          <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            Email: <span style={{ color: 'var(--admin-color-primary)' }}>admin@whiteocean.com</span><br/>
            Pass: <span style={{ color: 'var(--admin-color-primary)' }}>admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
