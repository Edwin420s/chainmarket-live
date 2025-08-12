import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            loading: false
          })
          return response.data
        } catch (error) {
          set({ error: error.response?.data?.error || 'Login failed', loading: false })
          throw error
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            loading: false
          })
          return response.data
        } catch (error) {
          set({ error: error.response?.data?.error || 'Registration failed', loading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      initialize: async () => {
        const token = get().token
        if (!token) return

        try {
          const response = await api.get('/auth/me')
          set({
            user: response.data,
            isAuthenticated: true
          })
        } catch (error) {
          get().logout()
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
)

export default useAuthStore