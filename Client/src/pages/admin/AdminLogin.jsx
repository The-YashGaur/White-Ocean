import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle } from 'lucide-react';
import logo from '../../assets/whiteocean.png';
import './AdminLayout.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login?noCookie=true', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-no-cookie': 'true'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('whiteocean_admin_token', data.token || 'mock_admin_token_abcdef123456');
        // Reset sync flag so admin data re-fetches with the fresh token
        localStorage.removeItem('whiteocean_admin_hasSynced');
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid admin credentials. Please double check.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please check if your backend server is active.');
      setIsLoading(false);
    }
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


      </div>
    </div>
  );
};

export default AdminLogin;
