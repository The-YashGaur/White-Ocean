import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdminData, setAdminData } from '../../data/adminMockData';
import { 
  ArrowLeft, 
  ArrowRight, 
  Printer, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar,
  DollarSign,
  Package,
  XSquare,
  CheckCircle,
  Truck
} from 'lucide-react';
import './AdminLayout.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const allOrders = getAdminData('orders') || [];
    const found = allOrders.find(o => o._id === id);
    if (!found) {
      navigate('/admin/orders');
      return;
    }
    setOrder(found);
  }, [id, navigate]);

  // Advance Order Status Flow
  const advanceStatus = () => {
    if (!order) return;
    let nextStatus;
    switch(order.orderStatus) {
      case 'Placed': nextStatus = 'Processing'; break;
      case 'Processing': nextStatus = 'Packed'; break;
      case 'Packed': nextStatus = 'Out for Delivery'; break;
      case 'Out for Delivery': nextStatus = 'Delivered'; break;
      default: return; // already Delivered or Cancelled
    }

    const allOrders = getAdminData('orders') || [];
    const updated = allOrders.map(o => {
      if (o._id === order._id) {
        const nextPaymentStatus = nextStatus === 'Delivered' ? 'Paid' : o.paymentStatus;
        return { ...o, orderStatus: nextStatus, paymentStatus: nextPaymentStatus };
      }
      return o;
    });

    setAdminData('orders', updated);
    setOrder({
      ...order,
      orderStatus: nextStatus,
      paymentStatus: nextStatus === 'Delivered' ? 'Paid' : order.paymentStatus
    });
  };

  // Cancel order directly
  const cancelOrder = () => {
    if (!order) return;
    const allOrders = getAdminData('orders') || [];
    const updated = allOrders.map(o => {
      if (o._id === order._id) {
        return { ...o, orderStatus: 'Cancelled' };
      }
      return o;
    });
    setAdminData('orders', updated);
    setOrder({ ...order, orderStatus: 'Cancelled' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading purchase credentials...</div>;
  }

  const canAdvance = ['Placed', 'Processing', 'Packed', 'Out for Delivery'].includes(order.orderStatus);

  return (
    <div>
      {/* Back button and page Actions */}
      <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/admin/orders" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          <span>Back to Log</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {canAdvance && (
            <>
              <button 
                className="admin-btn"
                style={{ backgroundColor: 'var(--admin-color-success)', color: '#fff' }}
                onClick={advanceStatus}
              >
                <span>Transition Status ({order.orderStatus} &rarr; {
                  order.orderStatus === 'Placed' ? 'Processing' : 
                  order.orderStatus === 'Processing' ? 'Packed' :
                  order.orderStatus === 'Packed' ? 'Out for Delivery' : 'Delivered'
                })</span>
                <ArrowRight size={16} />
              </button>

              <button className="admin-btn admin-btn-danger" onClick={cancelOrder}>
                <XSquare size={16} />
                <span>Cancel Order</span>
              </button>
            </>
          )}

          <button className="admin-btn admin-btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Premium Invoice Grid */}
      <div className="admin-panel print-container" style={{ padding: '3rem' }}>
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--admin-border-color)', paddingBottom: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '36px', marginBottom: '0.5rem' }}>
              <circle cx="16" cy="16" r="14" stroke="#00aeef" strokeWidth="3" />
              <path d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              <circle cx="16" cy="16" r="3" fill="#00aeef" />
            </svg>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>WHITE OCEAN</h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Premium Organic Grocers Marketplace</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--admin-color-primary)' }}>INVOICE</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#475569' }}>
              <div><strong>Invoice ID:</strong> {order._id.toUpperCase()}</div>
              <div><strong>Purchase Date:</strong> {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`admin-badge ${order.orderStatus.toLowerCase()}`} style={{ marginRight: '0.5rem' }}>Fulfillment: {order.orderStatus}</span>
                <span className={`admin-badge ${order.paymentStatus.toLowerCase()}`}>Payment: {order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Shipping Metadata Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }} className="admin-profile-details">
          {/* User Dossier details */}
          <div style={{ borderRight: '1px solid var(--admin-border-color)', paddingRight: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-color-primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <User size={16} />
              <span>Customer Details</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{order.customerSnapshot.name}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{order.customerSnapshot.email}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{order.customerSnapshot.phone}</div>
          </div>

          {/* Delivery location address */}
          <div style={{ borderRight: '1px solid var(--admin-border-color)', paddingRight: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-color-primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <MapPin size={16} />
              <span>Shipping Address</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{order.shippingAddress.fullName}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.4 }}>
              {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pinCode}<br/>
              {order.shippingAddress.landmark && `Landmark: ${order.shippingAddress.landmark}`}
            </div>
          </div>

          {/* Transaction Ledgers */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-color-primary)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <CreditCard size={16} />
              <span>Payment Protocol</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{order.paymentMethod === 'CARD' ? 'Credit / Debit Card' : order.paymentMethod}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>Gateway: Stripe Portal</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>Transaction ID: TXN_MOCK_{order._id}</div>
          </div>
        </div>

        {/* Invoice Items Table list */}
        <div style={{ border: '1px solid var(--admin-border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2.5rem' }}>
          <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--admin-border-color)' }}>
                <th style={{ backgroundColor: 'var(--admin-color-light-alt)' }}>Purchased Catalog Item</th>
                <th style={{ backgroundColor: 'var(--admin-color-light-alt)' }}>Merchant Partners</th>
                <th style={{ backgroundColor: 'var(--admin-color-light-alt)', textAlign: 'right' }}>Price</th>
                <th style={{ backgroundColor: 'var(--admin-color-light-alt)', textAlign: 'center' }}>Quantity</th>
                <th style={{ backgroundColor: 'var(--admin-color-light-alt)', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div className="admin-cell-avatar">
                      <img src={item.productImage} alt={item.productName} className="admin-table-product-img" />
                      <div>
                        <div className="admin-cell-title">{item.productName}</div>
                        <div className="admin-cell-subtitle">ID: {item.product.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.sellerName}</td>
                  <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Final Financial summaries */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
              <span>Order Subtotal:</span>
              <span style={{ fontWeight: 600 }}>${order.itemsPrice.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
              <span>Sales Surcharge / Tax (5%):</span>
              <span style={{ fontWeight: 600 }}>${order.taxPrice.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#64748b' }}>
              <span>Doorstep Delivery Fees:</span>
              <span style={{ fontWeight: 600 }}>${order.deliveryPrice.toFixed(2)}</span>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--admin-border-color)', margin: '0.25rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', color: 'var(--admin-color-dark)' }}>
              <strong>Grand Total Due:</strong>
              <strong style={{ color: 'var(--admin-color-primary)' }}>${order.totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CSS patch specifically for print style guides */}
      <style>{`
        @media print {
          .no-print, header, aside, .admin-sidebar, .admin-topbar, .admin-mobile-menu-btn {
            display: none !important;
          }
          .admin-workspace {
            background-color: #fff !important;
            color: #000 !important;
          }
          .admin-frame {
            margin-left: 0 !important;
          }
          .admin-content {
            padding: 0 !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;
