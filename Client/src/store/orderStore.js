import { create } from 'zustand';

const API_URL = 'http://localhost:5000/api/orders';

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
}));

export default useOrderStore;