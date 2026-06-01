import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin Geral',
    email: 'admin@empresa.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'AG',
    department: 'TI',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@empresa.com',
    password: '123456',
    role: 'user',
    avatar: 'JS',
    department: 'Comercial',
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    password: '123456',
    role: 'user',
    avatar: 'MS',
    department: 'Financeiro',
    createdAt: '2024-03-01',
  },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        const user = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        )
        if (user) {
          const { password: _, ...safeUser } = user
          set({ currentUser: safeUser, isAuthenticated: true })
          return { success: true }
        }
        return { success: false, error: 'E-mail ou senha inválidos.' }
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
