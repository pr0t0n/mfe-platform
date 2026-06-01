import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_USERS = [
  { id: '1', name: 'Admin Geral',    email: 'admin@empresa.com',  password: 'admin123', role: 'admin', avatar: 'AG', department: 'TI',        active: true,  createdAt: '2024-01-10' },
  { id: '2', name: 'João Silva',     email: 'joao@empresa.com',   password: '123456',   role: 'user',  avatar: 'JS', department: 'Comercial',  active: true,  createdAt: '2024-02-15' },
  { id: '3', name: 'Maria Santos',   email: 'maria@empresa.com',  password: '123456',   role: 'user',  avatar: 'MS', department: 'Financeiro', active: true,  createdAt: '2024-03-01' },
  { id: '4', name: 'Carlos Pereira', email: 'carlos@empresa.com', password: '123456',   role: 'user',  avatar: 'CP', department: 'RH',         active: true,  createdAt: '2024-03-20' },
  { id: '5', name: 'Ana Lima',       email: 'ana@empresa.com',    password: '123456',   role: 'user',  avatar: 'AL', department: 'Marketing',  active: false, createdAt: '2024-04-01' },
]

const SEED_PASSWORDS = Object.fromEntries(INITIAL_USERS.map((u) => [u.id, u.password]))

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,

      findByCredentials: (email, password) => {
        const user = get().users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password &&
            u.active
        )
        return user ?? null
      },

      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: String(Date.now()),
              avatar: user.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
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
    {
      name: 'cyberops-users-v2',
      version: 1,
      migrate: (old) => {
        // Garante que usuários seed sempre têm senha mesmo vindo do localStorage antigo
        const users = (old?.users ?? INITIAL_USERS).map((u) => ({
          ...u,
          password: u.password ?? SEED_PASSWORDS[u.id] ?? '',
        }))
        return { users }
      },
    }
  )
)
