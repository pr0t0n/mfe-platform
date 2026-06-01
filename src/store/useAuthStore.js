import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useUserStore } from './useUserStore'

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        const user = useUserStore.getState().findByCredentials(email, password)
        if (user) {
          const { password: _, ...safeUser } = user
          set({ currentUser: safeUser, isAuthenticated: true })
          return { success: true }
        }
        return { success: false, error: 'E-mail ou senha inválidos, ou usuário inativo.' }
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      updateProfile: (data) =>
        set((state) => ({
          currentUser: { ...state.currentUser, ...data },
        })),
    }),
    { name: 'mfe-auth' }
  )
)
