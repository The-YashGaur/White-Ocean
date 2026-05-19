import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import CategoryCard from '../components/ui/CategoryCard';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import { categories, vendors } from '../data/mockData';
import useProductStore from '../store/productStore';
import './Home.css';

const Home = () => {
  const { featuredProducts, isLoading, fetchFeaturedProducts } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-title">
              Fresh Groceries <br />
              <span className="text-primary">Delivered to You</span>
            </h1>

            <p className="hero-subtitle">
              Shop from the best local vendors. Get fresh produce, dairy, and
              everyday essentials delivered in minutes.
            </p>

            <div className="hero-search">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="hero-search-input"
              />

              <Button size="lg" className="hero-search-btn">
                <Search size={20} />
                Search
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Fresh Groceries"
              className="hero-image"
            />

            <motion.div
              className="floating-badge"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <span className="badge-icon">🌿</span>
              <div className="badge-text">
                <strong>100% Fresh</strong>
                <span>Organic Produce</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="categories-section py-20">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Button variant="ghost">View All</Button>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section py-20 bg-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href = '/products';
              }}
            >
              View All
            </Button>
          </div>

          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--color-text-gray)',
              }}
            >
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-6 product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="vendors-section py-20">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Vendors</h2>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <motion.div
                key={vendor.id}
                className="vendor-card"
                whileHover={{ y: -5 }}
              >
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="vendor-image"
                />

                <div className="vendor-info">
                  <h3 className="vendor-name">{vendor.name}</h3>
                  <p className="vendor-stats">
                    ⭐ {vendor.rating} • {vendor.orders}+ Orders
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;