import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // Actions
  login: async (credentials) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ isLoading: false });
        if (data.pendingVerification) {
          return { success: false, pendingVerification: true, email: data.email, error: data.error };
        }
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Network error. Please try again later.' };
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.pendingVerification) {
          set({ isLoading: false });
          return { success: true, pendingVerification: true, email: data.email };
        }
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Network error. Please try again later.' };
    }
  },
  
  logout: async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  },
  
  updateProfile: async (updatedData) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.data,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: data.error || 'Update failed' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Update failed' };
    }
  },

  becomeVendor: async (applicationData) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/become-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.data,
          isLoading: false
        });
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: data.error || 'Application submission failed' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Network error. Please try again later.' };
    }
  },
  
  
  // Check if user is authenticated (for protected routes)
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true };
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return { success: false, error: 'Network error. Please try again later.' };
    }
  },

  sendEmailOTP: async (email) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/send-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error. Please try again later.' };
    }
  },

  verifyEmailOTP: async (email, otp) => {
    set({ isLoading: true });
    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false
        });
        return { success: true, message: data.message };
      } else {
        set({ isLoading: false });
        return { success: false, error: data.error || 'Verification failed' };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Network error. Please try again later.' };
    }
  }
}));

export default useAuthStore;
