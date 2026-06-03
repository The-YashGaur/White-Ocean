import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  DollarSign, 
  Star, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Layers,
  Sparkles,
  Search,
  X,
  CheckCircle,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import './Cart.css'; // Leverage standard styling system

const API_BASE = 'http://localhost:8000/api/vendor';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'products', 'orders'
  
  // Analytics State
  const [stats, setStats] = useState({
    totalProducts: 0,
    ordersCount: 0,
    salesAmount: 0,
    avgRating: 5.0,
    lowStockProducts: 0
  });

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    category: 'Fruits',
    price: '',
    stockQuantity: '',
    productImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    description: ''
  });

  const categoriesList = [
    "Fruits", "Vegetables", "Snacks", "Beverages", "Dairy", "Bakery", "Frozen Food", 
    "Personal Care", "Household", "Instant Food", "Tea & Coffee", "Cleaning", 
    "Baby Care", "Pet Care", "Health", "Stationery"
  ];

  const { user } = useAuthStore();

  const fetchAllData = async () => {
    if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Analytics
      const resStats = await fetch(`${API_BASE}/analytics`, { credentials: 'include' });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.data);

      // 2. Fetch Products
      const resProds = await fetch(`${API_BASE}/products`, { credentials: 'include' });
      const dataProds = await resProds.json();
      if (dataProds.success) setProducts(dataProds.data);

      // 3. Fetch Orders
      const resOrders = await fetch(`${API_BASE}/orders`, { credentials: 'include' });
      const dataOrders = await resOrders.json();
      if (dataOrders.success) setOrders(dataOrders.data);

    } catch (err) {
      console.error(err);
      setError('Failed to synchronize with vendor registry API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      // Give a tiny delay for initializing/auth checks
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Product submitted successfully!');
        setShowAddForm(false);
        setNewProduct({
          productName: '',
          category: 'Fruits',
          price: '',
          stockQuantity: '',
          productImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
          description: ''
        });
        fetchAllData();
      } else {
        alert(data.error || 'Failed to submit product');
      }
    } catch (error) {
      alert('Failed to submit product due to a network connection error.');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this product from your store catalog?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE}/products/${prodId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('Product expunged successfully!');
        fetchAllData();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      alert('Delete failed.');
    }
  };

  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return (
      <div className="container py-20 text-center" style={{ backgroundColor: '#0B0F19', color: '#F8FAFC', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '450px', padding: '2.5rem', background: '#111827', border: '1px solid #1F2937', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#F8FAFC' }}>Access Denied</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            You do not have merchant permissions to access this control panel.
          </p>
          <Link to="/become-vendor">
            <Button size="lg" style={{ backgroundColor: '#00AEEF', color: '#fff', border: 'none', padding: '0.75rem 1.5rem' }}>Apply for Vendor Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Activity className="animate-spin text-primary" size={48} />
          <h2 style={{ color: '#cbd5e1' }}>Synchronizing Store Registers...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-portal py-12" style={{ backgroundColor: '#0B0F19', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div className="container">
        
        {/* Portal Header */}
        <div className="vendor-portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #1E293B', paddingBottom: '1.5rem' }}>
          <div>
            <span style={{ color: '#00AEEF', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Merchant Deck</span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.25rem 0 0 0', background: 'linear-gradient(to right, #FFFFFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Store Control Panel</h1>
          </div>
          
          <button className="admin-btn admin-btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#00AEEF', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            <span>Launch Product</span>
          </button>
        </div>

        {/* Overview Stats Row */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="admin-stat-card" style={{ background: '#111827', border: '1px solid #1F2937', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 500 }}>Store Sales</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>₹{stats.salesAmount.toFixed(2)}</h3>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.75rem', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
          </div>

          <div className="admin-stat-card" style={{ background: '#111827', border: '1px solid #1F2937', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 500 }}>Fulfillment count</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{stats.ordersCount} Sales</h3>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '12px' }}>
              <ShoppingBag size={24} />
            </div>
          </div>

          <div className="admin-stat-card" style={{ background: '#111827', border: '1px solid #1F2937', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 500 }}>Satisfaction rating</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={20} fill="#f59e0b" stroke="#f59e0b" />
                <span>{stats.avgRating}</span>
              </h3>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}>
              <Star size={24} />
            </div>
          </div>

          <div className="admin-stat-card" style={{ background: '#111827', border: '1px solid #1F2937', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 500 }}>Active items</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{stats.totalProducts} items</h3>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '0.75rem', borderRadius: '12px' }}>
              <Layers size={24} />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="vendor-tab-nav" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #1E293B', marginBottom: '2rem' }}>
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '2px solid #00AEEF' : '2px solid transparent', color: activeTab === 'overview' ? '#00AEEF' : '#94A3B8', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Sales
          </button>
          
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'products' ? '2px solid #00AEEF' : '2px solid transparent', color: activeTab === 'products' ? '#00AEEF' : '#94A3B8', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('products')}
          >
            Catalog Inventory ({products.length})
          </button>

          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'orders' ? '2px solid #00AEEF' : '2px solid transparent', color: activeTab === 'orders' ? '#00AEEF' : '#94A3B8', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('orders')}
          >
            Customer Orders ({orders.length})
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="admin-profile-grid">
            
            {/* Sales Chart placeholder */}
            <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Sales Growth</h3>
                <span style={{ color: '#22c55e', display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                  <TrendingUp size={14} /> +12.4% this week
                </span>
              </div>
              
              {/* Minimalist SVG Graph */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', background: '#0F172A', borderRadius: '12px', border: '1px dashed #1E293B', position: 'relative' }}>
                <svg width="100%" height="180" style={{ overflow: 'visible', padding: '0 20px' }}>
                  <path d="M 0 150 Q 80 120 160 110 T 320 60 T 480 30 T 640 10" fill="none" stroke="#00AEEF" strokeWidth="4" />
                  <path d="M 0 150 Q 80 120 160 110 T 320 60 T 480 30 T 640 10 L 640 180 L 0 180 Z" fill="url(#grad)" opacity="0.1" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00AEEF" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', justifyContent: 'space-between', width: '90%', fontSize: '0.75rem', color: '#64748B' }}>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            {/* Notifications Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                  <span>Store Warnings</span>
                </h3>
                
                {stats.lowStockProducts > 0 ? (
                  <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', color: '#fbbf24' }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong style={{ display: 'block' }}>Low Stock Detected!</strong>
                      <span>{stats.lowStockProducts} products in your catalog are running low on inventory (less than 10 units). Update quantities soon.</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748B', fontSize: '0.85rem' }}>
                    <CheckCircle size={24} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0 }}>All inventory items are sufficiently stocked.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Catalog Tab Content */}
        {activeTab === 'products' && (
          <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1F2937', color: '#9CA3AF', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Product Credential</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Price</th>
                    <th style={{ padding: '1rem' }}>Inventory Stock</th>
                    <th style={{ padding: '1rem' }}>Approval Status</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #1F2937' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={p.productImage} alt={p.productName} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{p.productName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {p._id.toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1' }}>{p.category}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>₹{p.price.toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: p.stockQuantity === 0 ? '#ef4444' : p.stockQuantity < 10 ? '#f59e0b' : '#cbd5e1'
                          }}>
                            {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '100px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: p.isApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: p.isApproved ? '#22c55e' : '#fbbf24'
                          }}>
                            {p.isApproved ? 'Approved Store' : 'Pending Verification'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
                            onClick={() => handleDeleteProduct(p._id)}
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        No product listings added to your store yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1F2937', color: '#9CA3AF', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Order Ref ID</th>
                    <th style={{ padding: '1rem' }}>Customer</th>
                    <th style={{ padding: '1rem' }}>Items Ordered</th>
                    <th style={{ padding: '1rem' }}>Store share</th>
                    <th style={{ padding: '1rem' }}>Fulfillment Status</th>
                    <th style={{ padding: '1rem' }}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((o) => (
                      <tr key={o._id} style={{ borderBottom: '1px solid #1F2937' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {o._id.toUpperCase()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600 }}>{o.customerSnapshot?.name || 'Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.customerSnapshot?.phone}</div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          {o.vendorItems?.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>₹{o.vendorSubtotal?.toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '100px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: o.orderStatus === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: o.orderStatus === 'Delivered' ? '#22c55e' : '#3b82f6'
                          }}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '100px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: o.paymentStatus === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: o.paymentStatus === 'Paid' ? '#22c55e' : '#ef4444'
                          }}>
                            {o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        No orders recorded for your store products yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add Product Drawer Popup Form */}
      {showAddForm && (
        <div className="admin-modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="admin-modal-container" style={{ background: '#111827', border: '1px solid #1F2937', width: '90%', maxWidth: '520px', borderRadius: '24px', overflow: 'hidden' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1F2937' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Launch Store Product</h3>
              <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }} onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct}>
              <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="admin-form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Product Display Name</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0F172A', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                    placeholder="e.g. Organic Strawberries"
                    value={newProduct.productName}
                    onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Category</label>
                    <select 
                      style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0F172A', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0F172A', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                      placeholder="e.g. 150"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Stock Level Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0F172A', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                    placeholder="e.g. 50"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Media Image URL</label>
                  <input 
                    type="url" 
                    required 
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0F172A', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                    value={newProduct.productImage}
                    onChange={(e) => setNewProduct({ ...newProduct, productImage: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Store Catalog Description</label>
                  <textarea 
                    rows="3"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0F172A', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                    placeholder="Enter short details about the product..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid #1F2937' }}>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ background: '#1F2937', color: '#F8FAFC', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" style={{ background: '#00AEEF', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Publish Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .vendor-portal-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
          }
          
          .vendor-tab-nav {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
            border-bottom: none !important;
          }
          
          .vendor-tab-nav button {
            text-align: left !important;
            border-bottom: none !important;
            border-left: 3px solid transparent !important;
            padding: 0.6rem 1rem !important;
            color: #94A3B8 !important;
          }
          
          .vendor-tab-nav button.active {
            border-left-color: #00AEEF !important;
            background: #111827 !important;
            color: #00AEEF !important;
          }
          
          .admin-profile-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default VendorDashboard;
