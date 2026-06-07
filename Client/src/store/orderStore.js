import { create } from 'zustand';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/orders`;

const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        set({
          currentOrder: data.data,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      }

      set({
        isLoading: false,
        error: data.error || 'Order failed',
      });

      return {
        success: false,
        error: data.error || 'Order failed',
      };
    } catch (error) {
      set({
        isLoading: false,
        error: 'Network error',
      });

      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/my-orders`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        set({
          orders: data.data,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          data: data.data,
        };
      }

      set({
        orders: [],
        isLoading: false,
        error: data.error || 'Failed to fetch orders',
      });

      return {
        success: false,
        error: data.error || 'Failed to fetch orders',
      };
    } catch (error) {
      set({
        orders: [],
        isLoading: false,
        error: 'Network error',
      });

      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  fetchOrderById: async (orderId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        set({
          currentOrder: data.data,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          data: data.data,
        };
      }

      set({
        currentOrder: null,
        isLoading: false,
        error: data.error || 'Failed to fetch order',
      });

      return {
        success: false,
        error: data.error || 'Failed to fetch order',
      };
    } catch (error) {
      set({
        currentOrder: null,
        isLoading: false,
        error: 'Network error',
      });

      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  validateCoupon: async (code, orderAmount) => {
    try {
      const response = await fetch(`${API_URL}/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code, orderAmount }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error trying to validate coupon' };
    }
  },

  createRazorpaySession: async (orderItems, couponCode) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_URL}/razorpay-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ orderItems, couponCode }),
      });

      const data = await response.json();

      set({ isLoading: false });
      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: 'Network error generating payment session',
      });

      return {
        success: false,
        error: 'Network error generating payment session',
      };
    }
  },
}));

export default useOrderStore;