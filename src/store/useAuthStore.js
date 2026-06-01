import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { token, user } = await api.login(email, password)
          localStorage.setItem('cyberops-token', token)
          set({ currentUser: user, isAuthenticated: true })
          return { success: true }
        } catch (e) {
          return { success: false, error: e.message }
        }
      },

      logout: () => {
        localStorage.removeItem('cyberops-token')
        set({ currentUser: null, isAuthenticated: false })
      },

      updateProfile: (data) =>
        set((state) => ({ currentUser: { ...state.currentUser, ...data } })),
    }),
    { name: 'cyberops-session', partialize: (s) => ({ currentUser: s.currentUser, isAuthenticated: s.isAuthenticated }) }
  )
)
