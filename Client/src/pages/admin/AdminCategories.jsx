import React, { useState, useEffect } from 'react';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  X
} from 'lucide-react';
import './AdminLayout.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer/Modal Popup form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isNewMode, setIsNewMode] = useState(false);

  useEffect(() => {
    setCategories(getAdminData('categories') || []);
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (cat) => {
    setIsNewMode(false);
    setEditingCategory({ ...cat });
    setShowFormModal(true);
  };

  const handleAddClick = () => {
    setIsNewMode(true);
    setEditingCategory({
      name: '',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80'
    });
    setShowFormModal(true);
  };

  const handleDeleteClick = (catId) => {
    const confirm = window.confirm("Are you sure you want to delete this category? Products mapped to this category may need to be reclassified.");
    if (!confirm) return;

    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    setAdminData('categories', updated);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    let updated;
    if (isNewMode) {
      const newCat = {
        ...editingCategory,
        id: Date.now()
      };
      updated = [...categories, newCat];
    } else {
      updated = categories.map(c => {
        if (c.id === editingCategory.id) {
          return { ...editingCategory };
        }
        return c;
      });
    }
    setCategories(updated);
    setAdminData('categories', updated);
    setShowFormModal(false);
    setEditingCategory(null);
  };

  return (
    <div>
      {/* Search Header */}
      <div className="admin-filters-panel">
        <div className="admin-search-box">
          <Search size={18} className="admin-search-icon" />
          <input 
            type="text" 
            placeholder="Search categories by name..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-actions">
          <button className="admin-btn admin-btn-primary" onClick={handleAddClick}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Main Categories Panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Product Categories Classification ({filteredCategories.length})</h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Icon / Image</th>
                <th>Category Name</th>
                <th>Reference ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <img 
                        src={c.image} 
                        alt={c.name} 
                        style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--admin-border-color)' }}
                      />
                    </td>
                    <td className="admin-cell-title" style={{ fontSize: '1rem' }}>
                      {c.name}
                    </td>
                    <td className="admin-cell-subtitle" style={{ fontSize: '0.85rem' }}>
                      {c.id}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                          onClick={() => handleEditClick(c)}
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                          onClick={() => handleDeleteClick(c.id)}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={32} style={{ color: '#94a3b8' }} />
                      <span>No matching categories found in the portal registers.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal Form Popup */}
      {showFormModal && editingCategory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{isNewMode ? 'Create New Category Tag' : 'Edit Category Tag'}</h3>
              <button className="admin-modal-close-btn" onClick={() => setShowFormModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="catName">Category Tag Name</label>
                  <input 
                    id="catName"
                    type="text" 
                    className="admin-form-input"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="catImage">Category Thumbnail Image URL</label>
                  <input 
                    id="catImage"
                    type="url" 
                    className="admin-form-input"
                    value={editingCategory.image}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
