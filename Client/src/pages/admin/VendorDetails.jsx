import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  ArrowLeft, 
  Check, 
  XSquare, 
  Mail, 
  Phone, 
  Star,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import './AdminLayout.css';

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const allVendors = getAdminData('vendors') || [];
    const foundVendor = allVendors.find(v => v.id === id);
    if (!foundVendor) {
      navigate('/admin/vendors');
      return;
    }
    setVendor(foundVendor);

    // Filter products from this seller
    const allProducts = getAdminData('products') || [];
    const sellerProducts = allProducts.filter(p => p.sellerName === foundVendor.name);
    setProducts(sellerProducts);
  }, [id, navigate]);

  const updateStatus = (nextStatus) => {
    if (!vendor) return;
    const allVendors = getAdminData('vendors') || [];
    const updatedVendors = allVendors.map(v => {
      if (v.id === vendor.id) {
        return { ...v, status: nextStatus };
      }
      return v;
    });
    setAdminData('vendors', updatedVendors);
    setVendor({ ...vendor, status: nextStatus });
  };

  if (!vendor) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading partner details...</div>;
  }

  return (
    <div>
      {/* Back Nav */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/vendors" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          <span>Back to Partners</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {vendor.status !== 'Approved' && (
            <button 
              className="admin-btn"
              style={{ backgroundColor: 'var(--admin-color-success)', color: '#fff' }}
              onClick={() => updateStatus('Approved')}
            >
              <Check size={16} />
              <span>Approve Merchant</span>
            </button>
          )}

          {vendor.status !== 'Suspended' && (
            <button 
              className="admin-btn admin-btn-danger"
              onClick={() => updateStatus('Suspended')}
            >
              <XSquare size={16} />
              <span>Suspend Merchant</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Details Layout */}
      <div className="admin-profile-grid">
        {/* Left Card: Brand Badge */}
        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'fit-content' }}>
          <div className="admin-profile-sidebar">
            <img 
              src={vendor.image} 
              alt={vendor.name} 
              className="admin-profile-sidebar-img"
              style={{ borderRadius: '24px' }}
            />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>{vendor.name}</h2>
              <span className={`admin-badge ${vendor.status.toLowerCase()}`}>{vendor.status}</span>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--admin-border-color)', margin: '1rem 0' }}></div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Mail size={16} />
                <span>{vendor.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Phone size={16} />
                <span>{vendor.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Stats & Store Catalog items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Performance cards */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Merchant Performance Snapshot</h3>
            </div>

            <div className="admin-profile-details">
              <div className="admin-detail-item">
                <span className="admin-detail-label">Fulfillment Count</span>
                <span className="admin-detail-value-large" style={{ color: 'var(--admin-color-dark)' }}>{vendor.ordersCount} completed orders</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Total Store Sales</span>
                <span className="admin-detail-value-large" style={{ color: 'var(--admin-color-success)' }}>
                  ${vendor.salesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Satisfaction Index</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className="admin-detail-value-large" style={{ color: 'var(--admin-color-warning)' }}>{vendor.rating.toFixed(1)}</span>
                  <div style={{ display: 'flex', color: 'var(--admin-color-warning)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.floor(vendor.rating) ? 'var(--admin-color-warning)' : 'none'} 
                        stroke="var(--admin-color-warning)" 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Online Catalog</span>
                <span className="admin-detail-value-large" style={{ color: 'var(--admin-color-primary)' }}>{products.length} Products</span>
              </div>
            </div>
          </div>

          {/* Catalog items */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Merchant Store Catalog ({products.length})</h3>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Inventory Stock</th>
                    <th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="admin-cell-avatar">
                            <img src={p.productImage} alt={p.productName} className="admin-table-product-img" />
                            <div>
                              <div className="admin-cell-title">{p.productName}</div>
                              <div className="admin-cell-subtitle">ID: {p._id.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                        <td>
                          <span style={{ 
                            fontWeight: 600, 
                            color: p.stockQuantity === 0 ? 'var(--admin-color-danger)' : p.stockQuantity < 10 ? 'var(--admin-color-warning)' : 'inherit' 
                          }}>
                            {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${p.isApproved ? 'approved' : 'pending'}`}>
                            {p.isApproved ? 'Approved' : 'Pending Review'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No items added to the catalog by this merchant yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
