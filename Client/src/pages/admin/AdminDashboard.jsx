import React, { useState, useEffect } from 'react';
import { getAnalytics, getAdminData } from '../../data/adminMockData';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminLayout.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStockProducts: 0
  });

  const [activeChart, setActiveChart] = useState('revenue'); // 'revenue' or 'orders'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    setStats(getAnalytics());
  }, []);

  // Custom data points for the SVG charts
  const revenueData = [
    { day: 'Mon', value: 850, orders: 12 },
    { day: 'Tue', value: 1250, orders: 18 },
    { day: 'Wed', value: 980, orders: 15 },
    { day: 'Thu', value: 1950, orders: 24 },
    { day: 'Fri', value: 1600, orders: 20 },
    { day: 'Sat', value: 2450, orders: 35 },
    { day: 'Sun', value: 2100, orders: 29 }
  ];

  // Helper to calculate SVG points
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const points = revenueData.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (revenueData.length - 1);
    
    // Calculate Y based on active chart
    const maxVal = activeChart === 'revenue' ? 3000 : 40;
    const currentVal = activeChart === 'revenue' ? d.value : d.orders;
    const y = height - paddingY - (currentVal * (height - 2 * paddingY)) / maxVal;
    
    return { x, y, data: d };
  });

  // Build SVG path for line and filled area
  const linePath = points.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    
    // Smooth bezier curve control points
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 3;
    const cpY1 = prev.y;
    const cpX2 = prev.x + 2 * (p.x - prev.x) / 3;
    const cpY2 = p.y;
    
    return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = linePath ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

  // Get Top Products & Recent Orders
  const products = getAdminData('products') || [];
  const orders = getAdminData('orders') || [];

  // Sort products by rating or filter out active ones
  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div>
      {/* 8 Stats Overview Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Total Users</span>
            <span className="admin-stat-value">{stats.totalUsers}</span>
          </div>
          <div className="admin-stat-icon-box bg-primary-glow">
            <Users size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Total Vendors</span>
            <span className="admin-stat-value">{stats.totalVendors}</span>
          </div>
          <div className="admin-stat-icon-box bg-info-glow">
            <Store size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Total Products</span>
            <span className="admin-stat-value">{stats.totalProducts}</span>
          </div>
          <div className="admin-stat-icon-box bg-success-glow">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Total Revenue</span>
            <span className="admin-stat-value">${stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="admin-stat-icon-box bg-warning-glow">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Total Orders</span>
            <span className="admin-stat-value">{stats.totalOrders}</span>
          </div>
          <div className="admin-stat-icon-box bg-primary-glow">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Pending Orders</span>
            <span className="admin-stat-value">{stats.pendingOrders}</span>
          </div>
          <div className="admin-stat-icon-box bg-warning-glow">
            <Clock size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Delivered Orders</span>
            <span className="admin-stat-value">{stats.deliveredOrders}</span>
          </div>
          <div className="admin-stat-icon-box bg-success-glow">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <span className="admin-stat-title">Low Stock</span>
            <span className="admin-stat-value" style={{ color: stats.lowStockProducts > 0 ? 'var(--admin-color-danger)' : 'inherit' }}>
              {stats.lowStockProducts}
            </span>
          </div>
          <div className="admin-stat-icon-box bg-danger-glow">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Component */}
      <div className="admin-panel" style={{ position: 'relative' }}>
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Administrative Analytics</h2>
          <div className="admin-filter-actions">
            <button 
              className={`admin-btn admin-btn-sm ${activeChart === 'revenue' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              onClick={() => setActiveChart('revenue')}
            >
              Revenue Sales ($)
            </button>
            <button 
              className={`admin-btn admin-btn-sm ${activeChart === 'orders' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              onClick={() => setActiveChart('orders')}
            >
              Order Count
            </button>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <svg className="admin-chart-svg" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--admin-color-primary)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--admin-color-primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} className="admin-chart-grid-line" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} className="admin-chart-grid-line" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} className="admin-chart-grid-line" />

            {/* Filled Area */}
            {areaPath && <path d={areaPath} className="admin-chart-area" />}

            {/* Curve Line */}
            {linePath && <path d={linePath} className="admin-chart-line" />}

            {/* X-Axis labels */}
            {points.map((p, i) => (
              <text 
                key={i} 
                x={p.x} 
                y={height - 10} 
                className="admin-chart-label" 
                textAnchor="middle"
              >
                {p.data.day}
              </text>
            ))}

            {/* Y-Axis labels */}
            <text x={paddingX - 10} y={paddingY + 5} className="admin-chart-label" textAnchor="end">
              {activeChart === 'revenue' ? '$3K' : '40'}
            </text>
            <text x={paddingX - 10} y={height / 2 + 5} className="admin-chart-label" textAnchor="end">
              {activeChart === 'revenue' ? '$1.5K' : '20'}
            </text>
            <text x={paddingX - 10} y={height - paddingY + 5} className="admin-chart-label" textAnchor="end">
              0
            </text>

            {/* Interactive Data Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === i ? 7 : 4}
                className="admin-chart-dot"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPoint !== null && (
            <div 
              className="admin-chart-tooltip"
              style={{
                left: `${(points[hoveredPoint].x / width) * 100}%`,
                top: `${(points[hoveredPoint].y / height) * 100}%`,
              }}
            >
              {activeChart === 'revenue' ? (
                <div>
                  <strong>{revenueData[hoveredPoint].day} Revenue</strong><br/>
                  ${revenueData[hoveredPoint].value} Sales
                </div>
              ) : (
                <div>
                  <strong>{revenueData[hoveredPoint].day} Orders</strong><br/>
                  {revenueData[hoveredPoint].orders} completed
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product & Order grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="admin-split-grid">
        {/* Recent Orders log */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Recent Purchase Registry</h2>
            <Link to="/admin/orders" className="admin-btn admin-btn-sm admin-btn-secondary" style={{ textDecoration: 'none' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="admin-cell-title">
                      <Link to={`/admin/order/${o._id}`} style={{ color: 'var(--admin-color-primary)', textDecoration: 'none' }}>
                        {o._id.toUpperCase()}
                      </Link>
                    </td>
                    <td>{o.customerSnapshot.name}</td>
                    <td>${o.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`admin-badge ${o.orderStatus.toLowerCase()}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top selling products */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Top Rated Catalog Items</h2>
            <Link to="/admin/products" className="admin-btn admin-btn-sm admin-btn-secondary" style={{ textDecoration: 'none' }}>
              <span>Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topProducts.map((p) => (
              <div 
                key={p._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.75rem', 
                  borderRadius: '14px', 
                  border: '1px solid var(--admin-border-color)' 
                }}
              >
                <img src={p.productImage} alt={p.productName} className="admin-table-product-img" />
                <div style={{ flexGrow: 1 }}>
                  <div className="admin-cell-title">{p.productName}</div>
                  <div className="admin-cell-subtitle">{p.category} • ${p.price.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--admin-color-warning)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Award size={16} />
                  <span>{p.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .admin-split-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
