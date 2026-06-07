import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Store, Star, Mail, Phone, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { API_BASE_URL } from '../config';
import './Products.css'; // Leverage inventory catalog CSS

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/vendors`);
        const data = await res.json();
        if (data.success) {
          setVendors(data.data);
        }
      } catch (error) {
        console.error('Failed to retrieve vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Activity className="animate-spin text-primary" size={48} />
          <h2>Loading Vendor Stores...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="vendors-page py-12" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Direct Merchant Shopping</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0', color: 'var(--color-text-dark)' }}>Meet Our Verified Vendor Partners</h1>
          <p style={{ color: 'var(--color-text-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Shop directly from specialized local stores and boutique merchant catalogs. Fresh produce, authentic dairy, and high-quality staples.
          </p>
        </div>

        {/* Search Panel */}
        <div className="products-filter-panel mb-8" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '480px', display: 'flex', alignItems: 'center' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search vendor stores by name..." 
              className="search-input"
              style={{ width: '100%', padding: '0.75rem 1.25rem 0.75rem 3rem', borderRadius: '100px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', background: '#fff', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {filteredVendors.map((vendor) => (
              <motion.div
                key={vendor.id}
                className="vendor-card"
                style={{ background: '#FFFFFF', border: '1px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
              >
                {/* Visual Store Header banner */}
                <div style={{ height: '110px', background: 'linear-gradient(135deg, #00AEEF 0%, #008ECC 100%)', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-30px', left: '1.5rem', width: '70px', height: '70px', borderRadius: '20px', border: '4px solid #fff', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: '#fff' }}>
                    <img 
                      src={vendor.image} 
                      alt={vendor.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '2.5rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0' }}>{vendor.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                      <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                      <span>{vendor.rating.toFixed(1)} Verified rating</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} />
                      <span>{vendor.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} />
                      <span>{vendor.phone}</span>
                    </div>
                  </div>

                  <Link to={`/vendor/shop/${vendor.id}`} style={{ textDecoration: 'none', marginTop: 'auto' }}>
                    <Button className="w-full flex justify-center items-center gap-2" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <Store size={18} />
                      <span>Visit Catalog Shop</span>
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-gray)' }}>
            <Store size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
            <h3>No verified vendor partner matches your query.</h3>
          </div>
        )}

      </div>
    </div>
  );
};

export default Vendors;
