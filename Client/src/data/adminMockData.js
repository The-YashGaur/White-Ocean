const STORAGE_PREFIX = 'whiteocean_admin_';
const API_BASE = 'http://localhost:8000/api/admin';

// Helper: Get admin auth headers using stored JWT token
const getAdminHeaders = () => {
  const token = localStorage.getItem('whiteocean_admin_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token && !token.startsWith('mock_')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Synchronous Fallbacks
const initialUsers = [
  { _id: 'u1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1 555-0199', createdAt: new Date().toISOString(), address: '123 Main St, New York', totalOrders: 0, totalSpent: 0, status: 'Active' }
];
const initialVendors = [
  { _id: 'v1', firstName: 'Fresh Farms', lastName: 'Ltd', email: 'contact@freshfarms.com', phone: '+1 555-0210', rating: 4.8, ordersCount: 0, salesAmount: 0, profileImage: 'https://images.unsplash.com/photo-1595853035070-59a39fe84dd3?auto=format&fit=crop&w=200&q=80', status: 'Approved', role: 'vendor' }
];

// Helper to fire events to re-render React components
const notifyUpdate = () => {
  window.dispatchEvent(new Event('adminDataUpdated'));
};

// Async background fetcher
const fetchFromBackend = async (key) => {
  try {
    let endpoint = `${API_BASE}/${key}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAdminHeaders(),
      credentials: 'include'
    });

    const resData = await response.json();
    if (resData.success) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(resData.data));
      notifyUpdate();
    }
  } catch (error) {
    console.error(`Error syncing ${key} with backend:`, error);
  }
};

// Fetch dashboard analytics from backend
const fetchAnalyticsFromBackend = async () => {
  try {
    const response = await fetch(`${API_BASE}/analytics`, {
      method: 'GET',
      headers: getAdminHeaders(),
      credentials: 'include'
    });
    const resData = await response.json();
    if (resData.success) {
      localStorage.setItem(STORAGE_PREFIX + 'analytics', JSON.stringify(resData.data));
      notifyUpdate();
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};

// Sync all database collections on load
let hasSynced = false;
export const triggerBackendSync = () => {
  if (hasSynced) return;
  hasSynced = true;
  // Auto-reset after 5 seconds so next admin page navigation re-syncs
  setTimeout(() => { hasSynced = false; }, 5000);

  // Background fetch
  fetchAnalyticsFromBackend();
  fetchFromBackend('users');
  fetchFromBackend('vendors');
  fetchFromBackend('products');
  fetchFromBackend('coupons');
  fetchFromBackend('notifications');
  fetchFromBackend('orders');
  fetchFromBackend('payments');
  fetchFromBackend('settings');
};

// Start sync automatically
if (typeof window !== 'undefined') {
  setTimeout(triggerBackendSync, 1000);
}

// ── GET ADMIN DATA (Cached synchronously for React) ──────────
export const getAdminData = (key) => {
  // Auto-sync in background on access
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      if (key === 'analytics') fetchAnalyticsFromBackend();
      else fetchFromBackend(key);
    }, 100);
  }

  const fullKey = STORAGE_PREFIX + key;
  const value = localStorage.getItem(fullKey);
  if (value !== null) {
    return JSON.parse(value);
  }

  // Initial fallbacks if cache is empty
  let initialValue = [];
  if (key === 'users') initialValue = initialUsers;
  else if (key === 'vendors') initialValue = initialVendors;
  else if (key === 'categories') {
    initialValue = [
      { id: 1, name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80' },
      { id: 2, name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=300&q=80' },
      { id: 3, name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80' },
      { id: 4, name: 'Seafood', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=300&q=80' },
      { id: 5, name: 'Snacks', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=300&q=80' },
      { id: 6, name: 'Beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80' }
    ];
  } else if (key === 'settings') {
    initialValue = {
      websiteName: 'White Ocean E-Commerce',
      deliveryCharge: 40,
      freeDeliveryMin: 500,
      taxPercentage: 5,
      contactEmail: 'support@whiteocean.com',
      contactPhone: '+1 (800) 555-GROCERY',
      banners: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1200&q=80'
      ]
    };
  }

  localStorage.setItem(fullKey, JSON.stringify(initialValue));
  return initialValue;
};

// ── SET ADMIN DATA (Persist locally & push to Express Backend) 
export const setAdminData = async (key, data) => {
  const fullKey = STORAGE_PREFIX + key;
  localStorage.setItem(fullKey, JSON.stringify(data));
  notifyUpdate();

  // Find what changed and update backend
  try {
    if (key === 'users') {
      // Find blocked/active updates
      for (const user of data) {
        if (user._id && !user._id.toString().startsWith('u')) {
          await fetch(`${API_BASE}/users/${user._id}/status`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            credentials: 'include',
            body: JSON.stringify({ status: user.status })
          });
        }
      }
    } else if (key === 'vendors') {
      // Find vendor approvals/suspensions
      for (const vendor of data) {
        if (vendor._id && !vendor._id.toString().startsWith('v')) {
          await fetch(`${API_BASE}/vendors/${vendor._id}/status`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            credentials: 'include',
            body: JSON.stringify({ status: vendor.status })
          });
        }
      }
    } else if (key === 'products') {
      // Find product updates (approval, hide)
      for (const product of data) {
        if (product._id && !product._id.toString().startsWith('p')) {
          await fetch(`${API_BASE}/products/${product._id}/approval`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            credentials: 'include',
            body: JSON.stringify({ isApproved: product.isApproved })
          });
          await fetch(`${API_BASE}/products/${product._id}/hide`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            credentials: 'include',
            body: JSON.stringify({ isHidden: product.isHidden })
          });
        }
      }
    } else if (key === 'coupons') {
      // Full Coupon CRUD
      const currentDbCoupons = await (await fetch(`${API_BASE}/coupons`, { headers: getAdminHeaders(), credentials: 'include' })).json();
      if (currentDbCoupons.success) {
        const dbIds = currentDbCoupons.data.map(c => c._id.toString());
        const localIds = data.map(c => c._id ? c._id.toString() : '');

        // 1. Create or Update Coupons
        for (const localCoupon of data) {
          if (!localCoupon._id || localCoupon._id.toString().startsWith('mock_') || !dbIds.includes(localCoupon._id.toString())) {
            const cleanCoupon = { ...localCoupon };
            if (cleanCoupon._id && cleanCoupon._id.toString().startsWith('mock_')) delete cleanCoupon._id;

            await fetch(`${API_BASE}/coupons`, {
              method: 'POST',
              headers: getAdminHeaders(),
              credentials: 'include',
              body: JSON.stringify(cleanCoupon)
            });
          } else {
            // Update
            await fetch(`${API_BASE}/coupons/${localCoupon._id}`, {
              method: 'PUT',
              headers: getAdminHeaders(),
              credentials: 'include',
              body: JSON.stringify(localCoupon)
            });
          }
        }

        // 2. Delete removed Coupons
        for (const dbCoupon of currentDbCoupons.data) {
          if (!localIds.includes(dbCoupon._id.toString())) {
            await fetch(`${API_BASE}/coupons/${dbCoupon._id}`, {
              method: 'DELETE',
              headers: getAdminHeaders(),
              credentials: 'include'
            });
          }
        }
      }
    } else if (key === 'orders') {
      // Find order status updates
      for (const order of data) {
        if (order._id && !order._id.toString().startsWith('o')) {
          await fetch(`${API_BASE}/orders/${order._id}/status`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            credentials: 'include',
            body: JSON.stringify({ orderStatus: order.orderStatus })
          });
        }
      }
    } else if (key === 'settings') {
      // Sync settings update to backend
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify(data)
      });
    } else if (key === 'notifications') {
      // Full Notification CRUD
      const currentDbNotifications = await (await fetch(`${API_BASE}/notifications`, { headers: getAdminHeaders(), credentials: 'include' })).json();
      if (currentDbNotifications.success) {
        const dbIds = currentDbNotifications.data.map(n => n._id.toString());
        const localIds = data.map(n => n._id ? n._id.toString() : '');

        // 1. Create or Update Notifications
        for (const localNotif of data) {
          if (!localNotif._id || localNotif._id.toString().startsWith('mock_') || !dbIds.includes(localNotif._id.toString())) {
            const cleanNotif = { ...localNotif };
            if (cleanNotif._id && cleanNotif._id.toString().startsWith('mock_')) delete cleanNotif._id;

            await fetch(`${API_BASE}/notifications`, {
              method: 'POST',
              headers: getAdminHeaders(),
              credentials: 'include',
              body: JSON.stringify(cleanNotif)
            });
          } else {
            // Update status (Active/Expired)
            await fetch(`${API_BASE}/notifications/${localNotif._id}/status`, {
              method: 'PUT',
              headers: getAdminHeaders(),
              credentials: 'include',
              body: JSON.stringify({ status: localNotif.status })
            });
          }
        }

        // 2. Delete removed Notifications
        for (const dbNotif of currentDbNotifications.data) {
          if (!localIds.includes(dbNotif._id.toString())) {
            await fetch(`${API_BASE}/notifications/${dbNotif._id}`, {
              method: 'DELETE',
              headers: getAdminHeaders(),
              credentials: 'include'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error updating backend for ${key}:`, error);
  }

  return true;
};

// ── GET ANALYTICS ─────────────────────────────────────────────
export const getAnalytics = () => {
  const fullKey = STORAGE_PREFIX + 'analytics';
  const value = localStorage.getItem(fullKey);
  if (value !== null) {
    return JSON.parse(value);
  }

  // Fallback initial object
  return {
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    lowStockProducts: 0
  };
};
