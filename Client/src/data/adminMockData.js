const STORAGE_PREFIX = 'whiteocean_admin_';

// Initial Mock Datasets
const initialUsers = [
  {
    _id: 'u1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-0199',
    createdAt: '2026-04-12T10:00:00Z',
    address: '123 Main St, New York, NY 10001',
    totalOrders: 12,
    totalSpent: 480.50,
    status: 'Active',
  },
  {
    _id: 'u2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-0145',
    createdAt: '2026-03-24T14:30:00Z',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    totalOrders: 28,
    totalSpent: 1250.75,
    status: 'Active',
  },
  {
    _id: 'u3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.j@example.com',
    phone: '+1 555-0188',
    createdAt: '2026-05-01T08:15:00Z',
    address: '789 Pine Rd, Chicago, IL 60601',
    totalOrders: 3,
    totalSpent: 92.20,
    status: 'Blocked',
  },
  {
    _id: 'u4',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.b@example.com',
    phone: '+1 555-0122',
    createdAt: '2026-05-18T16:45:00Z',
    address: '321 Elm St, Seattle, WA 98101',
    totalOrders: 1,
    totalSpent: 24.50,
    status: 'Active',
  }
];

const initialVendors = [
  {
    id: 'v1',
    name: 'Fresh Farms Ltd',
    email: 'contact@freshfarms.com',
    phone: '+1 555-0210',
    rating: 4.8,
    ordersCount: 1240,
    salesAmount: 8430.00,
    image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84dd3?auto=format&fit=crop&w=200&q=80',
    status: 'Approved'
  },
  {
    id: 'v2',
    name: 'Green Valley Organics',
    email: 'sales@greenvalley.com',
    phone: '+1 555-0220',
    rating: 4.9,
    ordersCount: 3450,
    salesAmount: 22450.50,
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=200&q=80',
    status: 'Approved'
  },
  {
    id: 'v3',
    name: 'Ocean Seafood Co',
    email: 'info@oceanseafood.com',
    phone: '+1 555-0230',
    rating: 4.7,
    ordersCount: 890,
    salesAmount: 14210.00,
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=200&q=80',
    status: 'Pending'
  },
  {
    id: 'v4',
    name: 'Quick Bakeries',
    email: 'hello@quickbakeries.com',
    phone: '+1 555-0240',
    rating: 4.2,
    ordersCount: 150,
    salesAmount: 1200.00,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    status: 'Suspended'
  }
];

const initialProducts = [
  {
    _id: 'p1',
    productName: 'Organic Bananas',
    category: 'Fruits',
    sellerName: 'Fresh Farms Ltd',
    price: 4.99,
    stockQuantity: 120,
    productImage: 'https://images.unsplash.com/photo-1571501443621-e0166a41f861?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh organic bananas directly from the farm.',
    rating: 4.8,
    isFeatured: true,
    isHidden: false,
    isApproved: true
  },
  {
    _id: 'p2',
    productName: 'Fresh Avocados',
    category: 'Vegetables',
    sellerName: 'Green Valley Organics',
    price: 6.50,
    stockQuantity: 8, // Low stock alert!
    productImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
    description: 'Perfectly ripe avocados, great for guacamole.',
    rating: 4.9,
    isFeatured: true,
    isHidden: false,
    isApproved: true
  },
  {
    _id: 'p3',
    productName: 'Whole Milk 1L',
    category: 'Dairy',
    sellerName: 'Green Valley Organics',
    price: 2.99,
    stockQuantity: 85,
    productImage: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
    description: 'Farm fresh whole milk.',
    rating: 4.5,
    isFeatured: false,
    isHidden: false,
    isApproved: true
  },
  {
    _id: 'p4',
    productName: 'Atlantic Salmon',
    category: 'Seafood',
    sellerName: 'Ocean Seafood Co',
    price: 15.99,
    stockQuantity: 3, // Low stock alert!
    productImage: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    description: 'Premium wild-caught Atlantic salmon.',
    rating: 4.7,
    isFeatured: true,
    isHidden: false,
    isApproved: false // Pending approval
  },
  {
    _id: 'p5',
    productName: 'Organic Spinach',
    category: 'Vegetables',
    sellerName: 'Green Valley Organics',
    price: 3.50,
    stockQuantity: 40,
    productImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    description: 'Crisp organic spinach leaves.',
    rating: 4.6,
    isFeatured: false,
    isHidden: false,
    isApproved: true
  },
  {
    _id: 'p6',
    productName: 'Orange Juice 1L',
    category: 'Beverages',
    sellerName: 'Fresh Farms Ltd',
    price: 5.49,
    stockQuantity: 0, // Out of stock!
    productImage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    description: '100% pure squeezed orange juice.',
    rating: 4.4,
    isFeatured: false,
    isHidden: true, // Hidden by admin
    isApproved: true
  }
];

const initialOrders = [
  {
    _id: 'o1',
    customerSnapshot: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-0199'
    },
    orderItems: [
      { product: 'p1', productName: 'Organic Bananas', productImage: 'https://images.unsplash.com/photo-1571501443621-e0166a41f861?auto=format&fit=crop&w=400&q=80', sellerName: 'Fresh Farms Ltd', price: 4.99, quantity: 2 },
      { product: 'p3', productName: 'Whole Milk 1L', productImage: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80', sellerName: 'Green Valley Organics', price: 2.99, quantity: 3 }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      phone: '+1 555-0199',
      address: '123 Main St',
      city: 'New York',
      pinCode: '10001',
      landmark: 'Near Central Park'
    },
    paymentMethod: 'CARD',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    itemsPrice: 18.95,
    taxPrice: 0.95,
    deliveryPrice: 40.00,
    totalPrice: 59.90,
    createdAt: '2026-05-18T10:15:00Z'
  },
  {
    _id: 'o2',
    customerSnapshot: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 555-0145'
    },
    orderItems: [
      { product: 'p2', productName: 'Fresh Avocados', productImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80', sellerName: 'Green Valley Organics', price: 6.50, quantity: 5 }
    ],
    shippingAddress: {
      fullName: 'Jane Smith',
      phone: '+1 555-0145',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      pinCode: '90001',
      landmark: 'Apt 4B'
    },
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    itemsPrice: 32.50,
    taxPrice: 1.63,
    deliveryPrice: 40.00,
    totalPrice: 74.13,
    createdAt: '2026-05-19T14:40:00Z'
  },
  {
    _id: 'o3',
    customerSnapshot: {
      name: 'Emily Brown',
      email: 'emily.b@example.com',
      phone: '+1 555-0122'
    },
    orderItems: [
      { product: 'p5', productName: 'Organic Spinach', productImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80', sellerName: 'Green Valley Organics', price: 3.50, quantity: 2 }
    ],
    shippingAddress: {
      fullName: 'Emily Brown',
      phone: '+1 555-0122',
      address: '321 Elm St',
      city: 'Seattle',
      pinCode: '98101',
      landmark: ''
    },
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Placed',
    itemsPrice: 7.00,
    taxPrice: 0.35,
    deliveryPrice: 40.00,
    totalPrice: 47.35,
    createdAt: '2026-05-20T01:10:00Z'
  }
];

const initialCategories = [
  { id: 1, name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'Seafood', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=300&q=80' },
  { id: 5, name: 'Snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=300&q=80' },
  { id: 6, name: 'Beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80' }
];

const initialCoupons = [
  { id: 1, code: 'SAVE20', discountType: 'percentage', discountValue: 20, minOrderAmount: 200, usageLimit: 50, usedCount: 14, expiryDate: '2026-07-31' },
  { id: 2, code: 'FIRSTORDER', discountType: 'flat', discountValue: 50, minOrderAmount: 300, usageLimit: 100, usedCount: 42, expiryDate: '2026-06-30' },
  { id: 3, code: 'FREEDELIVERY', discountType: 'percentage', discountValue: 100, minOrderAmount: 150, usageLimit: 500, usedCount: 124, expiryDate: '2026-12-31' }
];

const initialPayments = [
  { id: 'PAY-001', orderId: 'o1', customer: 'John Doe', amount: 59.90, paymentMethod: 'CARD', status: 'Success', createdAt: '2026-05-18T10:16:00Z' },
  { id: 'PAY-002', orderId: 'o2', customer: 'Jane Smith', amount: 74.13, paymentMethod: 'UPI', status: 'Success', createdAt: '2026-05-19T14:41:00Z' },
  { id: 'PAY-003', orderId: 'o3', customer: 'Emily Brown', amount: 47.35, paymentMethod: 'COD', status: 'Success', createdAt: '2026-05-20T01:10:00Z' }
];

const initialNotifications = [
  { id: 1, title: 'Summer Festival Sale!', message: 'Use code SAVE20 to get flat 20% off on all organic fruits & fresh dairy goods this weekend.', type: 'promotional', createdAt: '2026-05-19T09:00:00Z', status: 'Active' },
  { id: 2, title: 'Server Upgrade Scheduled', message: 'We will be conducting a routine server maintenance window on May 24th from 2:00 AM to 4:00 AM UTC.', type: 'alert', createdAt: '2026-05-15T12:00:00Z', status: 'Active' },
  { id: 3, title: 'Free Delivery Threshold Reduced', message: 'Spend above $150 and enjoy free doorstep deliveries. Use code FREEDELIVERY today!', type: 'offer', createdAt: '2026-05-10T08:00:00Z', status: 'Expired' }
];

const initialSettings = {
  websiteName: 'White Ocean E-Commerce',
  deliveryCharge: 40,
  freeDeliveryMin: 500,
  taxPercentage: 5,
  contactEmail: 'support@whiteocean.com',
  contactPhone: '+1 (800) 555-GROCERY',
  banners: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80'
  ],
  footerSettings: {
    copyright: '© 2026 White Ocean E-Commerce. All rights reserved.',
    facebook: 'https://facebook.com/whiteocean',
    twitter: 'https://twitter.com/whiteocean',
    instagram: 'https://instagram.com/whiteocean'
  }
};

// LocalStorage Helper functions
export const getAdminData = (key) => {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const value = localStorage.getItem(fullKey);
    if (value !== null) {
      return JSON.parse(value);
    }
    
    // Fallbacks to initial state if not found
    let initialValue;
    switch (key) {
      case 'users': initialValue = initialUsers; break;
      case 'vendors': initialValue = initialVendors; break;
      case 'products': initialValue = initialProducts; break;
      case 'orders': initialValue = initialOrders; break;
      case 'categories': initialValue = initialCategories; break;
      case 'coupons': initialValue = initialCoupons; break;
      case 'payments': initialValue = initialPayments; break;
      case 'notifications': initialValue = initialNotifications; break;
      case 'settings': initialValue = initialSettings; break;
      default: initialValue = null;
    }
    
    if (initialValue !== null) {
      localStorage.setItem(fullKey, JSON.stringify(initialValue));
    }
    return initialValue;
  } catch (error) {
    console.error('Failed to read admin data from localStorage:', error);
    return null;
  }
};

export const setAdminData = (key, data) => {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.setItem(fullKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to write admin data to localStorage:', error);
    return false;
  }
};

// Extra analytics calculations helper
export const getAnalytics = () => {
  const users = getAdminData('users') || [];
  const vendors = getAdminData('vendors') || [];
  const products = getAdminData('products') || [];
  const orders = getAdminData('orders') || [];
  
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  const pendingOrders = orders.filter(o => o.orderStatus === 'Placed' || o.orderStatus === 'Processing' || o.orderStatus === 'Packed').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const lowStockProducts = products.filter(p => p.stockQuantity < 10).length;

  return {
    totalUsers: users.length,
    totalVendors: vendors.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    pendingOrders,
    deliveredOrders,
    lowStockProducts
  };
};
