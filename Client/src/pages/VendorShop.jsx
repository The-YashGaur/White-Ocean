import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Store, Star, Mail, Phone, Activity } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';

const VendorShop = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch public vendors list and find matching vendor
        const resVendors = await fetch('http://localhost:8000/api/products/vendors');
        const dataVendors = await resVendors.json();
        if (dataVendors.success) {
          const found = dataVendors.data.find(v => v.id === id);
          if (found) {
            setVendor(found);
            
            // 2. Fetch all products and filter by this sellerName
            const resProds = await fetch('http://localhost:8000/api/products');
            const dataProds = await resProds.json();
            if (dataProds.success) {
              const filtered = dataProds.data.filter(
                p => p.sellerName && p.sellerName.toLowerCase() === found.name.toLowerCase()
              );
              setProducts(filtered);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load shop storefront:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Activity className="animate-spin text-primary" size={48} />
          <h2>Loading storefront...</h2>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container py-20 text-center">
        <Store size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h2>Storefront Not Found</h2>
        <p style={{ color: '#64748b', margin: '0.5rem 0 2rem 0' }}>The vendor shop you are trying to visit does not exist or has been suspended.</p>
        <Link to="/vendors" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="vendor-shop-page py-12" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container">
        
        {/* Back navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/vendors" className="admin-btn admin-btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Back to Partners</span>
          </Link>
        </div>

        {/* Branded Store Hero Banner Card */}
        <div className="vendor-store-banner-card" style={{ background: '#FFFFFF', border: '1px solid #e2e8f0', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '3rem' }}>
          <div style={{ height: '160px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', width: '90px', height: '90px', borderRadius: '24px', border: '4px solid #fff', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.1)', background: '#fff' }}>
              <img src={vendor.image} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div className="vendor-store-details-bar" style={{ padding: '3.5rem 2rem 2rem 2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-end' }}>
            <div>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Merchant Partner</span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem 0' }}>{vendor.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.95rem', fontWeight: 600 }}>
                <Star size={18} fill="#f59e0b" stroke="#f59e0b" />
                <span>{vendor.rating.toFixed(1)} satisfaction rating</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                <Mail size={16} />
                <span>{vendor.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                <Phone size={16} />
                <span>{vendor.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog items panel */}
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            Browse Store Catalog ({products.length} Items)
          </h3>

          {products.length > 0 ? (
            <div className="grid grid-cols-5 gap-6 product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-gray)' }}>
              <Store size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3>This store hasn't uploaded any products to their public catalog yet.</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VendorShop;
