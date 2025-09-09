import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (token) => {
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common['Authorization'];
        }
        set({ token });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          get().setToken(token);
          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          get().setToken(token);
          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Registration failed' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.patch('/users/profile', userData);
          set({ user: response.data });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Profile update failed' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/forgot-password', { email });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Password reset request failed' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/reset-password', { token, newPassword });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Password reset failed' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
