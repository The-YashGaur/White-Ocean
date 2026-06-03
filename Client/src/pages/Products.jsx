import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Search, X } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import useProductStore from '../store/productStore';
import './Products.css';

const Products = () => {
  const { products, categories, isLoading, error, fetchProducts, fetchCategories } = useProductStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption]         = useState('');
  const [minPrice, setMinPrice]             = useState('');
  const [maxPrice, setMaxPrice]             = useState('');
  const [rating, setRating]                 = useState('');

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts({
      category: activeCategory,
      search:   debouncedSearch,
      sort:     sortOption,
      minPrice,
      maxPrice,
      rating,
    });
  }, [activeCategory, sortOption, debouncedSearch, rating, fetchProducts]);

  const handleSearch = () => {
    fetchProducts({ category: activeCategory, search: searchText, sort: sortOption, minPrice, maxPrice, rating });
  };

  const handleApplyPrice = () => {
    fetchProducts({ category: activeCategory, search: debouncedSearch, sort: sortOption, minPrice, maxPrice, rating });
  };

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearchText('');
    setDebouncedSearch('');
    setSortOption('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    fetchProducts({});
  };

  return (
    <div className="products-page py-12">
      <div className="container">

        {/* Page Header */}
        <div className="products-header">
          <h1 className="page-title">Shop Groceries</h1>
          <div className="products-search-bar">
            <input
              type="text"
              placeholder="Search products..."
              className="products-search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="search-icon" size={18} onClick={handleSearch} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="products-sidebar">
            <div className="filter-card">
              <div className="filter-header">
                <h3 className="filter-title">Categories</h3>
                <Filter size={16} className="text-gray" />
              </div>
              <ul className="category-list">
                <li
                  className={`category-item ${activeCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('All')}
                >
                  All Products
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat}
                    className={`category-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-card">
              <h3 className="filter-title">Price Range (₹)</h3>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="price-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="price-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={handleApplyPrice}>
                Apply Filter
              </Button>
            </div>

            <div className="filter-card">
              <h3 className="filter-title">Customer Rating</h3>
              <ul className="rating-filter-list" style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[5, 4, 3, 2].map((stars) => (
                  <li 
                    key={stars}
                    className={`rating-filter-item ${rating === stars ? 'active' : ''}`}
                    onClick={() => setRating(rating === stars ? '' : stars)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 500
                    }}
                  >
                    <span className="stars-icon" style={{ color: '#fbbf24', fontSize: '1.1rem' }}>
                      {'★'.repeat(stars)}{'☆'.repeat(5-stars)}
                    </span>
                    <span className="rating-text" style={{ fontSize: '0.9rem' }}>
                      {stars === 5 ? '5★ only' : `${stars}★ & above`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="ghost" className="w-full mt-2" onClick={handleClearFilters}>
              <X size={14} /> Clear All Filters
            </Button>
          </aside>

          {/* Main Content */}
          <main className="products-main">
            <div className="products-top-bar">
              <p className="results-count">
                {isLoading ? 'Loading...' : `Showing ${products.length} result${products.length !== 1 ? 's' : ''}`}
              </p>
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Sort by: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Error State */}
            {error && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
                <p>⚠️ {error}</p>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="product-card" style={{ background: '#f1f5f9', minHeight: 240, borderRadius: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && (
              <>
                {products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-gray)' }}>
                    <p style={{ fontSize: '1.1rem' }}>No products found.</p>
                    <Button variant="ghost" onClick={handleClearFilters} style={{ marginTop: '1rem' }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

      </div>
    </div>
  );
};

export default Products;
