import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_USERS = [
  { id: '1', name: 'Admin Geral', email: 'admin@empresa.com', role: 'admin', avatar: 'AG', department: 'TI', active: true, createdAt: '2024-01-10' },
  { id: '2', name: 'João Silva', email: 'joao@empresa.com', role: 'user', avatar: 'JS', department: 'Comercial', active: true, createdAt: '2024-02-15' },
  { id: '3', name: 'Maria Santos', email: 'maria@empresa.com', role: 'user', avatar: 'MS', department: 'Financeiro', active: true, createdAt: '2024-03-01' },
  { id: '4', name: 'Carlos Pereira', email: 'carlos@empresa.com', role: 'user', avatar: 'CP', department: 'RH', active: true, createdAt: '2024-03-20' },
  { id: '5', name: 'Ana Lima', email: 'ana@empresa.com', role: 'user', avatar: 'AL', department: 'Marketing', active: false, createdAt: '2024-04-01' },
]

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,

      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: String(Date.now()),
              avatar: user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
              createdAt: new Date().toISOString().split('T')[0],
              active: true,
            },
          ],
        })),

      updateUser: (id, data) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),

      deleteUser: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

      toggleUserActive: (id) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, active: !u.active } : u
          ),
        })),

      getUserById: (id) => get().users.find((u) => u.id === id),
    }),
    { name: 'mfe-users' }
  )
)
