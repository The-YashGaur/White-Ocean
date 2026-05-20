import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  AlertTriangle,
  X,
  Sparkles,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react';
import './AdminLayout.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [approvalFilter, setApprovalFilter] = useState('All');

  // Edit Drawer Popup state
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // New product form states (for quick add drawer integration)
  const [isNewMode, setIsNewMode] = useState(false);

  useEffect(() => {
    setProducts(getAdminData('products') || []);
    setCategories(getAdminData('categories') || []);
  }, []);

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' ? true : p.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'OutOfStock') matchesStock = p.stockQuantity === 0;
    else if (stockFilter === 'LowStock') matchesStock = p.stockQuantity > 0 && p.stockQuantity < 10;
    else if (stockFilter === 'InStock') matchesStock = p.stockQuantity >= 10;

    let matchesApproval = true;
    if (approvalFilter === 'Approved') matchesApproval = p.isApproved === true;
    else if (approvalFilter === 'Pending') matchesApproval = p.isApproved === false;
    else if (approvalFilter === 'Hidden') matchesApproval = p.isHidden === true;
    else if (approvalFilter === 'Featured') matchesApproval = p.isFeatured === true;

    return matchesSearch && matchesCategory && matchesStock && matchesApproval;
  });

  // Toggle Features
  const toggleApprove = (productId) => {
    const updated = products.map(p => {
      if (p._id === productId) return { ...p, isApproved: !p.isApproved };
      return p;
    });
    setProducts(updated);
    setAdminData('products', updated);
  };

  const toggleFeatured = (productId) => {
    const updated = products.map(p => {
      if (p._id === productId) return { ...p, isFeatured: !p.isFeatured };
      return p;
    });
    setProducts(updated);
    setAdminData('products', updated);
  };

  const toggleHidden = (productId) => {
    const updated = products.map(p => {
      if (p._id === productId) return { ...p, isHidden: !p.isHidden };
      return p;
    });
    setProducts(updated);
    setAdminData('products', updated);
  };

  // Open Edit Drawer Popup
  const handleEditClick = (product) => {
    setIsNewMode(false);
    setEditingProduct({ ...product });
    setShowEditDrawer(true);
  };

  // Open Add Product Drawer
  const handleAddClick = () => {
    setIsNewMode(true);
    setEditingProduct({
      productName: '',
      category: categories[0]?.name || 'Fruits',
      sellerName: 'Admin Master',
      price: 0,
      stockQuantity: 0,
      productImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
      description: '',
      rating: 5.0,
      isFeatured: false,
      isHidden: false,
      isApproved: true
    });
    setShowEditDrawer(true);
  };

  // Delete trigger
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const updated = products.filter(p => p._id !== productToDelete._id);
    setProducts(updated);
    setAdminData('products', updated);
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Save Drawer edits
  const handleSaveProduct = (e) => {
    e.preventDefault();
    let updated;
    if (isNewMode) {
      const newProduct = {
        ...editingProduct,
        _id: 'p_' + Date.now(),
        price: parseFloat(editingProduct.price),
        stockQuantity: parseInt(editingProduct.stockQuantity)
      };
      updated = [...products, newProduct];
    } else {
      updated = products.map(p => {
        if (p._id === editingProduct._id) {
          return {
            ...editingProduct,
            price: parseFloat(editingProduct.price),
            stockQuantity: parseInt(editingProduct.stockQuantity)
          };
        }
        return p;
      });
    }
    setProducts(updated);
    setAdminData('products', updated);
    setShowEditDrawer(false);
    setEditingProduct(null);
  };

  const handleInputChange = (field, value) => {
    setEditingProduct(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Filters, search and add button */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search items by product name, vendor store..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-actions">
          <select className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select className="admin-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="All">All Stock Levels</option>
            <option value="InStock">Sufficient Stock (10+)</option>
            <option value="LowStock">Low Stock (&lt;10)</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>

          <select className="admin-select" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending Review</option>
            <option value="Featured">Featured</option>
            <option value="Hidden">Hidden</option>
          </select>

          <button className="admin-btn admin-btn-primary" onClick={handleAddClick}>
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Main product log panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Catalog Inventory Items ({filteredProducts.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Merchant</th>
                <th>Stock Quantity</th>
                <th>Visibility Flags</th>
                <th>Approval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity > 0 && p.stockQuantity < 10;
                  const isOut = p.stockQuantity === 0;
                  return (
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
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.category}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                      <td>
                        <span className="admin-cell-subtitle" style={{ fontSize: '0.85rem', color: 'var(--admin-color-dark)', fontWeight: 500 }}>{p.sellerName}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: isOut ? 'var(--admin-color-danger)' : isLow ? 'var(--admin-color-warning)' : 'inherit' 
                          }}>
                            {isOut ? 'Out of Stock' : `${p.stockQuantity} units`}
                          </span>
                          {isLow && <AlertTriangle size={14} style={{ color: 'var(--admin-color-warning)' }} title="Low Stock Warning!" />}
                          {isOut && <AlertCircle size={14} style={{ color: 'var(--admin-color-danger)' }} title="Depleted Inventory!" />}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            className={`admin-btn admin-btn-sm admin-btn-icon ${p.isFeatured ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                            onClick={() => toggleFeatured(p._id)}
                            title={p.isFeatured ? 'Featured active' : 'Set as Featured'}
                          >
                            <Sparkles size={14} />
                          </button>
                          
                          <button 
                            className={`admin-btn admin-btn-sm admin-btn-icon ${p.isHidden ? 'admin-btn-danger' : 'admin-btn-secondary'}`}
                            onClick={() => toggleHidden(p._id)}
                            title={p.isHidden ? 'Hidden from search' : 'Hide from search'}
                          >
                            {p.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => toggleApprove(p._id)}
                          className={`admin-badge ${p.isApproved ? 'approved' : 'pending'}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                          title={p.isApproved ? 'Click to reject/disapprove' : 'Click to approve catalog item'}
                        >
                          {p.isApproved ? 'Approved' : 'Pending Review'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link 
                            to={`/admin/product/${p._id}`}
                            className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                            title="Inspect complete details"
                          >
                            <Eye size={14} />
                          </Link>

                          <button 
                            className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                            onClick={() => handleEditClick(p)}
                            title="Edit inline"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button 
                            className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                            onClick={() => handleDeleteClick(p)}
                            title="Delete permanent"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching products found in the catalog.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Edit / Add Product Drawer Modal */}
      {showEditDrawer && editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{isNewMode ? 'Launch New Catalog Item' : 'Modify Product Credentials'}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowEditDrawer(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="prodName">Product Display Name</label>
                  <input 
                    id="prodName"
                    type="text" 
                    className="admin-form-input"
                    value={editingProduct.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    required 
                  />
                </div>

                <div className="admin-settings-row" style={{ marginBottom: 0 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="prodCategory">Category Classification</label>
                    <select 
                      id="prodCategory"
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={editingProduct.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="prodMerchant">Merchant / Seller</label>
                    <input 
                      id="prodMerchant"
                      type="text" 
                      className="admin-form-input"
                      value={editingProduct.sellerName}
                      onChange={(e) => handleInputChange('sellerName', e.target.value)}
                      disabled={!isNewMode}
                      required 
                    />
                  </div>
                </div>

                <div className="admin-settings-row" style={{ marginBottom: 0 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="prodPrice">Retail Price ($)</label>
                    <input 
                      id="prodPrice"
                      type="number" 
                      step="0.01"
                      className="admin-form-input"
                      value={editingProduct.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="prodStock">Stock Quantity</label>
                    <input 
                      id="prodStock"
                      type="number" 
                      className="admin-form-input"
                      value={editingProduct.stockQuantity}
                      onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="prodImage">Media URL Link</label>
                  <input 
                    id="prodImage"
                    type="url" 
                    className="admin-form-input"
                    value={editingProduct.productImage}
                    onChange={(e) => handleInputChange('productImage', e.target.value)}
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="prodDesc">Catalog Specification Description</label>
                  <textarea 
                    id="prodDesc"
                    className="admin-form-textarea"
                    value={editingProduct.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                    <input 
                      type="checkbox" 
                      checked={editingProduct.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    />
                    <span>Highlight on Home Banner (Featured)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                    <input 
                      type="checkbox" 
                      checked={editingProduct.isHidden}
                      onChange={(e) => handleInputChange('isHidden', e.target.checked)}
                    />
                    <span>Hide item from catalog search index</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowEditDrawer(false)}>Close Drawer</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Catalog Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Popup */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Purge Catalog Product</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
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
                    Are you absolutely sure you want to delete <strong>{productToDelete?.productName}</strong>? This catalog item will be expunged from search indexes and vendor shops.
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

export default AdminProducts;
