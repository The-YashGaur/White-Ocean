import React, { useState, useEffect } from 'react';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Save, 
  Settings, 
  Globe, 
  Percent, 
  Truck, 
  Mail, 
  Phone,
  Link,
  CheckCircle,
  Image
} from 'lucide-react';
import './AdminLayout.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setSettings(getAdminData('settings') || {});
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      footerSettings: {
        ...prev.footerSettings,
        [field]: value
      }
    }));
  };

  const handleBannerChange = (index, value) => {
    const updatedBanners = [...settings.banners];
    updatedBanners[index] = value;
    setSettings(prev => ({ ...prev, banners: updatedBanners }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const formatted = {
      ...settings,
      deliveryCharge: parseFloat(settings.deliveryCharge),
      freeDeliveryMin: parseFloat(settings.freeDeliveryMin),
      taxPercentage: parseFloat(settings.taxPercentage)
    };

    setAdminData('settings', formatted);
    setSuccessMsg('Configurations successfully saved and propagated across the platform!');
    
    // Auto clear alert
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  if (!settings) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading portal configuration details...</div>;
  }

  return (
    <div>
      {/* Save Success Alert */}
      {successMsg && (
        <div className="bg-success-glow" style={{ padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* General Meta Configurations */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--admin-color-primary)' }} />
              <span>Portal Branding & Identity</span>
            </h2>
          </div>

          <div className="admin-settings-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="siteName">Platform Display Name</label>
              <input 
                id="siteName"
                type="text" 
                className="admin-form-input" 
                value={settings.websiteName} 
                onChange={(e) => handleInputChange('websiteName', e.target.value)}
                required 
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="contactEmail">Customer Support Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  id="contactEmail"
                  type="email" 
                  className="admin-form-input" 
                  style={{ paddingLeft: '2.3rem' }}
                  value={settings.contactEmail} 
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="admin-settings-row">
            <div className="admin-form-group" style={{ gridColumn: 'span 1' }}>
              <label className="admin-form-label" htmlFor="contactPhone">Hotline Help Desk Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  id="contactPhone"
                  type="text" 
                  className="admin-form-input" 
                  style={{ paddingLeft: '2.3rem' }}
                  value={settings.contactPhone} 
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fees and Charges configuration */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} style={{ color: 'var(--admin-color-primary)' }} />
              <span>Surcharges, Deliveries & Tax Bounds</span>
            </h2>
          </div>

          <div className="admin-settings-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="deliveryCharge">Base Doorstep Delivery Charge ($)</label>
              <input 
                id="deliveryCharge"
                type="number" 
                step="0.01"
                className="admin-form-input" 
                value={settings.deliveryCharge} 
                onChange={(e) => handleInputChange('deliveryCharge', e.target.value)}
                required 
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="freeDeliveryMin">Free Delivery Surcharge Threshold ($)</label>
              <input 
                id="freeDeliveryMin"
                type="number" 
                step="1"
                className="admin-form-input" 
                value={settings.freeDeliveryMin} 
                onChange={(e) => handleInputChange('freeDeliveryMin', e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="admin-settings-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="taxPercentage">Platform Surcharge / GST Tax Rate (%)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="taxPercentage"
                  type="number" 
                  step="0.1"
                  className="admin-form-input" 
                  value={settings.taxPercentage} 
                  onChange={(e) => handleInputChange('taxPercentage', e.target.value)}
                  required 
                />
                <Percent size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Hero banners URL */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={18} style={{ color: 'var(--admin-color-primary)' }} />
              <span>Promotional Hero Banners</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {settings.banners.map((url, i) => (
              <div key={i} className="admin-form-group">
                <label className="admin-form-label" htmlFor={`banner-${i}`}>Promotion Banner Image URL #{i+1}</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    id={`banner-${i}`}
                    type="url" 
                    className="admin-form-input" 
                    value={url} 
                    onChange={(e) => handleBannerChange(i, e.target.value)}
                    required 
                  />
                  <img 
                    src={url} 
                    alt={`Banner ${i+1}`} 
                    style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer configurations */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} style={{ color: 'var(--admin-color-primary)' }} />
              <span>Portal Footer Copyrights & Social Directory</span>
            </h2>
          </div>

          <div className="admin-settings-row">
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="admin-form-label" htmlFor="footerCopyright">Footer Copyright Display Line</label>
              <input 
                id="footerCopyright"
                type="text" 
                className="admin-form-input" 
                value={settings.footerSettings.copyright} 
                onChange={(e) => handleFooterChange('copyright', e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="admin-settings-row">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="facebook">Facebook Portal Link</label>
              <div style={{ position: 'relative' }}>
                <Link size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  id="facebook"
                  type="url" 
                  className="admin-form-input" 
                  style={{ paddingLeft: '2.3rem' }}
                  value={settings.footerSettings.facebook} 
                  onChange={(e) => handleFooterChange('facebook', e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="instagram">Instagram Catalog Link</label>
              <div style={{ position: 'relative' }}>
                <Link size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  id="instagram"
                  type="url" 
                  className="admin-form-input" 
                  style={{ paddingLeft: '2.3rem' }}
                  value={settings.footerSettings.instagram} 
                  onChange={(e) => handleFooterChange('instagram', e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '0.85rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Save size={18} />
            <span style={{ fontSize: '1rem' }}>Save Global Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
