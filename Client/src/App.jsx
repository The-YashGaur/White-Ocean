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