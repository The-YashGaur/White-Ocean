import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  ArrowLeft, 
  Check, 
  XSquare, 
  Star, 
  Sparkles, 
  EyeOff, 
  Eye, 
  Edit2, 
  Trash2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import './AdminLayout.css';

const ProductDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const allProducts = getAdminData('products') || [];
    const found = allProducts.find(p => p._id === id);
    if (!found) {
      navigate('/admin/products');
      return;
    }
    setProduct(found);
  }, [id, navigate]);

  const updateProductField = (field, value) => {
    if (!product) return;
    const allProducts = getAdminData('products') || [];
    const updated = allProducts.map(p => {
      if (p._id === product._id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setAdminData('products', updated);
    setProduct({ ...product, [field]: value });
  };

  const confirmDelete = () => {
    if (!product) return;
    const allProducts = getAdminData('products') || [];
    const updated = allProducts.filter(p => p._id !== product._id);
    setAdminData('products', updated);
    setShowDeleteModal(false);
    navigate('/admin/products');
  };

  if (!product) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading inventory specification...</div>;
  }

  const isLow = product.stockQuantity > 0 && product.stockQuantity < 10;
  const isOut = product.stockQuantity === 0;

  return (
    <div>
      {/* Header back & action controls */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/products" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className={`admin-btn ${product.isApproved ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
            style={{ backgroundColor: !product.isApproved ? 'var(--admin-color-success)' : '', color: !product.isApproved ? '#fff' : '' }}
            onClick={() => updateProductField('isApproved', !product.isApproved)}
          >
            {product.isApproved ? <XSquare size={16} /> : <Check size={16} />}
            <span>{product.isApproved ? 'Disapprove Item' : 'Approve Item'}</span>
          </button>

          <button 
            className="admin-btn admin-btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            <span>Expunge Item</span>
          </button>
        </div>
      </div>

      {/* Main product card */}
      <div className="admin-panel">
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '3rem' }} className="admin-profile-grid">
          {/* Media column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <img 
              src={product.productImage} 
              alt={product.productName} 
              style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: '24px', border: '1px solid var(--admin-border-color)' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`admin-btn ${product.isFeatured ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                style={{ flexGrow: 1 }}
                onClick={() => updateProductField('isFeatured', !product.isFeatured)}
              >
                <Sparkles size={16} />
                <span>{product.isFeatured ? 'Featured Active' : 'Set as Featured'}</span>
              </button>

              <button 
                className={`admin-btn ${product.isHidden ? 'admin-btn-danger' : 'admin-btn-secondary'}`}
                style={{ flexGrow: 1 }}
                onClick={() => updateProductField('isHidden', !product.isHidden)}
              >
                {product.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{product.isHidden ? 'Hidden active' : 'Hide Product'}</span>
              </button>
            </div>
          </div>

          {/* Details column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className={`admin-badge ${product.isApproved ? 'approved' : 'pending'}`} style={{ marginBottom: '0.5rem' }}>
                {product.isApproved ? 'Approved Catalog' : 'Pending Verification'}
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0.25rem 0' }}>{product.productName}</h2>
              <div className="admin-cell-subtitle" style={{ fontSize: '0.95rem' }}>ID: {product._id.toUpperCase()}</div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="admin-detail-label">Retail Price</span>
                <span className="admin-detail-value-large" style={{ fontSize: '2rem', color: 'var(--admin-color-primary)' }}>${product.price.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="admin-detail-label">Stock Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className="admin-detail-value-large" style={{ color: isOut ? 'var(--admin-color-danger)' : isLow ? 'var(--admin-color-warning)' : 'var(--admin-color-success)' }}>
                    {isOut ? 'Depleted' : isLow ? 'Low' : 'Adequate'}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                    ({product.stockQuantity} units available)
                  </span>
                  {isLow && <AlertTriangle size={16} style={{ color: 'var(--admin-color-warning)' }} />}
                  {isOut && <AlertCircle size={16} style={{ color: 'var(--admin-color-danger)' }} />}
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--admin-border-color)' }}></div>

            <div className="admin-profile-details" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Category Classification</span>
                <span className="admin-detail-value" style={{ fontWeight: 600 }}>{product.category}</span>
              </div>

              <div className="admin-detail-item">
                <span className="admin-detail-label">Merchant / Shop</span>
                <span className="admin-detail-value" style={{ fontWeight: 600 }}>{product.sellerName}</span>
              </div>

              <div className="admin-detail-item">
                <span className="admin-detail-label">Customer Satisfaction</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                  <Star size={16} fill="var(--admin-color-warning)" stroke="var(--admin-color-warning)" />
                  <span className="admin-detail-value" style={{ fontWeight: 600 }}>{product.rating} / 5.0</span>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--admin-border-color)' }}></div>

            <div className="admin-detail-item">
              <span className="admin-detail-label">Product Specifications</span>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>
                {product.description || 'No detailed specifications have been added to the catalog for this product yet. Standard merchant retail policies apply.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Popup */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Purge Catalog Product</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <XSquare size={20} />
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div className="bg-danger-glow" style={{ padding: '0.75rem', borderRadius: '12px', color: 'var(--admin-color-danger)' }}>
                  <Trash2 size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: 'var(--admin-color-dark)' }}>Confirm Permanent Deletion?</p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Are you absolutely sure you want to delete <strong>{product.productName}</strong>? This catalog item will be expunged from search indexes and vendor shops.
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="admin-btn" style={{ backgroundColor: 'var(--admin-color-danger)', color: '#fff' }} onClick={confirmDelete}>Confirm Expunge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsAdmin;
