import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useRequestStore = create(
  persist(
    (set, get) => ({
      requests: [],

      submitRequest: ({ userId, userName, appId, appName, message }) => {
        const existing = get().requests.find(
          (r) => r.userId === userId && r.appId === appId && r.status === 'pending'
        )
        if (existing) return { success: false, error: 'Você já tem uma solicitação pendente para este app.' }

        set((state) => ({
          requests: [
            ...state.requests,
            {
              id: String(Date.now()),
              userId,
              userName,
              appId,
              appName,
              message: message || '',
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
          ],
        }))
        return { success: true }
      },

      approveRequest: (requestId) =>
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status: 'approved', resolvedAt: new Date().toISOString() } : r
          ),
        })),

      rejectRequest: (requestId) =>
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === requestId ? { ...r, status: 'rejected', resolvedAt: new Date().toISOString() } : r
          ),
        })),

      getUserRequests: (userId) => get().requests.filter((r) => r.userId === userId),

      getPendingCount: () => get().requests.filter((r) => r.status === 'pending').length,
    }),
    { name: 'mfe-requests' }
  )
)
