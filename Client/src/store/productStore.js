import { create } from 'zustand';
import { API_BASE_URL } from '../config';

const API_BASE = `${API_BASE_URL}/api/products`;

const useProductStore = create((set, get) => ({
  // ── State ──────────────────────────────────
  products: [],
  featuredProducts: [],  // first 8 for home page
  categories: [],        // unique categories from DB
  currentProduct: null,
  isLoading: false,
  error: null,

  // ── Fetch all products (with optional filters) ──
  fetchProducts: async ({ category = '', search = '', sort = '', minPrice = '', maxPrice = '', rating = '' } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (rating) params.append('rating', rating);

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

  settings: null,
  announcements: [],
  fetchSettings: async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      if (data.success) {
        set({ settings: data.data });
        return data.data;
      }
    } catch (err) {
      console.error('Failed to load portal settings:', err);
    }
    return null;
  },

  fetchAnnouncements: async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      const data = await res.json();
      if (data.success) {
        set({ announcements: data.data });
        return data.data;
      }
    } catch (err) {
      console.error('Failed to load portal announcements:', err);
    }
    return [];
  },
}));

export default useProductStore;
