import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loader from './components/ui/Loader';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';

// Admin Page Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import UserDetails from './pages/admin/UserDetails';
import AdminVendors from './pages/admin/AdminVendors';
import VendorDetails from './pages/admin/VendorDetails';
import AdminProducts from './pages/admin/AdminProducts';
import ProductDetailsAdmin from './pages/admin/ProductDetailsAdmin';
import AdminOrders from './pages/admin/AdminOrders';
import OrderDetails from './pages/admin/OrderDetails';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminPayments from './pages/admin/AdminPayments';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const Vendors = () => (
  <div className="container py-20">
    <h1>Vendors</h1>
  </div>
);

const VendorDashboard = () => (
  <div className="container py-20">
    <h1>Vendor Dashboard</h1>
  </div>
);

const NotFound = () => (
  <div className="container py-20 text-center">
    <h1>404 - Page Not Found</h1>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const checkAuth = useAuthStore(state => state.checkAuth);

  React.useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsInitializing(false);
    };
    initializeAuth();
  }, [checkAuth]);

  return (
    <>
      {isInitializing && <Loader onLoadingComplete={() => {}} />}
      
      {!isInitializing && (
      <div>
        <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendor/dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Command Deck Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
          <Route path="/admin/user/:id" element={<AdminLayout><UserDetails /></AdminLayout>} />
          <Route path="/admin/vendors" element={<AdminLayout><AdminVendors /></AdminLayout>} />
          <Route path="/admin/vendor/:id" element={<AdminLayout><VendorDetails /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
          <Route path="/admin/product/:id" element={<AdminLayout><ProductDetailsAdmin /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
          <Route path="/admin/order/:id" element={<AdminLayout><OrderDetails /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
          <Route path="/admin/coupons" element={<AdminLayout><AdminCoupons /></AdminLayout>} />
          <Route path="/admin/payments" element={<AdminLayout><AdminPayments /></AdminLayout>} />
          <Route path="/admin/notifications" element={<AdminLayout><AdminNotifications /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
    </div>
    )}
  </>
  );
}

export default App;