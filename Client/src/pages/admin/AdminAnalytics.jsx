import React, { useState, useEffect } from 'react';
import { getAdminData } from '../../data/adminMockData';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  BarChart2, 
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import './AdminLayout.css';

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [hoveredIndex, setHoveredIndex] = useState({ sales: null, users: null, orders: null });

  // Custom data patterns representing high fidelity platform growth metrics
  const analyticsData = {
    weekly: {
      sales: [
        { label: 'W1', value: 3400 }, { label: 'W2', value: 4200 }, 
        { label: 'W3', value: 3800 }, { label: 'W4', value: 5100 }
      ],
      users: [
        { label: 'W1', value: 85 }, { label: 'W2', value: 110 }, 
        { label: 'W3', value: 140 }, { label: 'W4', value: 195 }
      ],
      orders: [
        { label: 'W1', value: 45 }, { label: 'W2', value: 68 }, 
        { label: 'W3', value: 52 }, { label: 'W4', value: 88 }
      ]
    },
    monthly: {
      sales: [
        { label: 'Jan', value: 8500 }, { label: 'Feb', value: 12000 }, 
        { label: 'Mar', value: 10500 }, { label: 'Apr', value: 15400 },
        { label: 'May', value: 19800 }, { label: 'Jun', value: 24500 }
      ],
      users: [
        { label: 'Jan', value: 120 }, { label: 'Feb', value: 250 }, 
        { label: 'Mar', value: 420 }, { label: 'Apr', value: 680 },
        { label: 'May', value: 920 }, { label: 'Jun', value: 1240 }
      ],
      orders: [
        { label: 'Jan', value: 180 }, { label: 'Feb', value: 240 }, 
        { label: 'Mar', value: 210 }, { label: 'Apr', value: 380 },
        { label: 'May', value: 450 }, { label: 'Jun', value: 590 }
      ]
    }
  };

  const currentData = analyticsData[timeframe];

  // Helper function to map dataset coordinates to SVG lines
  const buildSvgPath = (data, maxVal, width = 500, height = 180, padX = 35, padY = 20) => {
    const points = data.map((d, i) => {
      const x = padX + (i * (width - 2 * padX)) / (data.length - 1);
      const y = height - padY - (d.value * (height - 2 * padY)) / maxVal;
      return { x, y };
    });

    const line = points.reduce((path, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (p.x - prev.x) / 3;
      const cpY2 = p.y;
      return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    const area = line ? `${line} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z` : '';
    return { line, area, points };
  };

  const renderSvgChart = (dataset, maxVal, type, glowClass) => {
    const width = 500;
    const height = 180;
    const padX = 35;
    const padY = 20;

    const { line, area, points } = buildSvgPath(dataset, maxVal, width, height, padX, padY);

    return (
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '180px', overflow: 'visible' }}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--admin-color-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={width - padX} y2={padY} className="admin-chart-grid-line" />
          <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} className="admin-chart-grid-line" />
          <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} className="admin-chart-grid-line" />

          {/* Area */}
          {area && <path d={area} fill={`url(#gradient-${type})`} />}

          {/* Curve */}
          {line && <path d={line} className="admin-chart-line" />}

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex[type] === i ? 6 : 3.5}
              className="admin-chart-dot"
              onMouseEnter={() => setHoveredIndex(prev => ({ ...prev, [type]: i }))}
              onMouseLeave={() => setHoveredIndex(prev => ({ ...prev, [type]: null }))}
            />
          ))}

          {/* Axis Labels */}
          {dataset.map((d, i) => (
            <text key={i} x={padX + (i * (width - 2 * padX)) / (dataset.length - 1)} y={height - 5} className="admin-chart-label" textAnchor="middle">
              {d.label}
            </text>
          ))}
        </svg>

        {/* Dynamic Interactive Tooltip Card */}
        {hoveredIndex[type] !== null && (
          <div 
            className="admin-chart-tooltip"
            style={{
              left: `${(points[hoveredIndex[type]].x / width) * 100}%`,
              top: `${(points[hoveredIndex[type]].y / height) * 100}%`,
            }}
          >
            <strong>{dataset[hoveredIndex[type]].label}:</strong> {type === 'sales' ? `$${dataset[hoveredIndex[type]].value.toLocaleString()}` : dataset[hoveredIndex[type]].value}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Timeframe Controller */}
      <div className="admin-filters-panel">
        <div className="admin-search-box" style={{ opacity: 0, pointerEvents: 'none' }}></div> {/* Spacer */}
        <div className="admin-filter-actions">
          <button 
            className={`admin-btn ${timeframe === 'weekly' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setTimeframe('weekly')}
          >
            <Calendar size={16} />
            <span>Weekly Sprints</span>
          </button>
          
          <button 
            className={`admin-btn ${timeframe === 'monthly' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setTimeframe('monthly')}
          >
            <BarChart2 size={16} />
            <span>Monthly Growth</span>
          </button>
        </div>
      </div>

      {/* Analytics Curve Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }} className="admin-stats-grid">
        {/* Sales Chart Card */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header" style={{ borderBottom: 'none', marginBottom: '0.75rem' }}>
            <h3 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} style={{ color: 'var(--admin-color-success)' }} />
              <span>Revenue Sales</span>
            </h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-color-success)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span>+18.4%</span>
              <ArrowUpRight size={12} />
            </span>
          </div>
          {renderSvgChart(currentData.sales, timeframe === 'weekly' ? 6000 : 30000, 'sales', 'bg-success-glow')}
        </div>

        {/* User Acquisition Card */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header" style={{ borderBottom: 'none', marginBottom: '0.75rem' }}>
            <h3 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--admin-color-primary)' }} />
              <span>Customer Registrations</span>
            </h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-color-primary)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span>+32.6%</span>
              <ArrowUpRight size={12} />
            </span>
          </div>
          {renderSvgChart(currentData.users, timeframe === 'weekly' ? 250 : 1500, 'users', 'bg-primary-glow')}
        </div>

        {/* Order Volume Card */}
        <div className="admin-panel" style={{ marginBottom: 0 }}>
          <div className="admin-panel-header" style={{ borderBottom: 'none', marginBottom: '0.75rem' }}>
            <h3 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} style={{ color: 'var(--admin-color-warning)' }} />
              <span>Order Fulfillments</span>
            </h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-color-warning)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span>+14.2%</span>
              <ArrowUpRight size={12} />
            </span>
          </div>
          {renderSvgChart(currentData.orders, timeframe === 'weekly' ? 100 : 700, 'orders', 'bg-warning-glow')}
        </div>
      </div>

      {/* Key Administrative Insights Panel */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--admin-color-primary)' }} />
            <span>Growth Diagnostics & Sprints</span>
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }} className="admin-profile-details">
          <div style={{ borderRight: '1px solid var(--admin-border-color)', paddingRight: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-color-dark)', fontSize: '0.95rem', fontWeight: 700 }}>Marketplace Core Performance Summary</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              The platform experienced a steep trajectory in customer registrations (+32.6%) this sprint, largely attributed to active campaign coupons and reduced free delivery surcharges. Customer acquisition curves show standard weekend spikes.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-color-dark)', fontSize: '0.95rem', fontWeight: 700 }}>Fulfillment Optimization Notes</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
              Merchant partners processed orders with high efficiency, maintaining an average fulfillment transition time of 14 hours. Standard transaction values increased by 8.4% on average due to organic fruit packages and premium seafood categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
