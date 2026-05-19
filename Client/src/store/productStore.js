import { create } from 'zustand';

const API_BASE = 'http://localhost:5000/api/products';

const useProductStore = create((set, get) => ({
  // ── State ──────────────────────────────────
  products: [],
  featuredProducts: [],  // first 8 for home page
  categories: [],        // unique categories from DB
  currentProduct: null,
  isLoading: false,
  error: null,

  // ── Fetch all products (with optional filters) ──
  fetchProducts: async ({ category = '', search = '', sort = '', minPrice = '', maxPrice = '' } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        set({ products: data.data, isLoading: false });
      } else {
        set({ error: data.error || 'Failed to load products', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Network error. Could not load products.', isLoading: false });
    }
  },

  // ── Fetch featured products for Home page ──
  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}?sort=rating`);
      const data = await res.json();
      if (data.success) {
        set({ featuredProducts: data.data.slice(0, 8), isLoading: false });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (err) {
      set({ error: 'Network error.', isLoading: false });
    }
  },

  // ── Fetch single product by MongoDB _id ──
  fetchProductById: async (id) => {
    set({ isLoading: true, error: null, currentProduct: null });
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const data = await res.json();
      if (data.success) {
        set({ currentProduct: data.data, isLoading: false });
      } else {
        set({ error: data.error || 'Product not found', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Network error.', isLoading: false });
    }
  },

  // ── Fetch distinct categories from DB ──
  fetchCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success) {
        set({ categories: data.data });
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  },
}));

export default useProductStore;
