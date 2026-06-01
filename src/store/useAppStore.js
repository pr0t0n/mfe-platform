import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_APPS = [
  {
    id: 'app-1',
    name: 'BI Analytics',
    description: 'Dashboards e relatórios estratégicos em tempo real.',
    url: 'https://analytics.empresa.com',
    icon: 'BarChart3',
    color: 'from-blue-500 to-cyan-500',
    category: 'Analytics',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: 'app-2',
    name: 'CRM Vendas',
    description: 'Gestão de clientes, leads e pipeline de vendas.',
    url: 'https://crm.empresa.com',
    icon: 'Users',
    color: 'from-violet-500 to-purple-600',
    category: 'CRM',
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'app-3',
    name: 'ERP Financeiro',
    description: 'Controle financeiro, contabilidade e orçamentos.',
    url: 'https://erp.empresa.com',
    icon: 'DollarSign',
    color: 'from-emerald-500 to-teal-600',
    category: 'ERP',
    active: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'app-4',
    name: 'RH & Talentos',
    description: 'Gestão de pessoas, recrutamento e desenvolvimento.',
    url: 'https://rh.empresa.com',
    icon: 'UserCheck',
    color: 'from-orange-400 to-rose-500',
    category: 'RH',
    active: true,
    createdAt: '2024-02-10',
  },
  {
    id: 'app-5',
    name: 'Marketing Hub',
    description: 'Campanhas, automação e análise de desempenho de marketing.',
    url: 'https://marketing.empresa.com',
    icon: 'Megaphone',
    color: 'from-pink-500 to-rose-600',
    category: 'Marketing',
    active: true,
    createdAt: '2024-02-20',
  },
  {
    id: 'app-6',
    name: 'Supply Chain',
    description: 'Gestão de estoque, logística e cadeia de suprimentos.',
    url: 'https://supply.empresa.com',
    icon: 'Package',
    color: 'from-amber-500 to-orange-600',
    category: 'Logística',
    active: true,
    createdAt: '2024-03-01',
  },
  {
    id: 'app-7',
    name: 'DevOps Portal',
    description: 'Deploy, monitoramento e infraestrutura de aplicações.',
    url: 'https://devops.empresa.com',
    icon: 'Terminal',
    color: 'from-slate-600 to-slate-800',
    category: 'TI',
    active: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'app-8',
    name: 'Legal & Compliance',
    description: 'Contratos, documentos legais e conformidade regulatória.',
    url: 'https://legal.empresa.com',
    icon: 'Scale',
    color: 'from-indigo-500 to-blue-700',
    category: 'Jurídico',
    active: true,
    createdAt: '2024-03-15',
  },
]

const INITIAL_PERMISSIONS = {
  'app-1': ['1', '2', '3'],
  'app-2': ['1', '2'],
  'app-3': ['1', '3'],
  'app-4': ['1'],
  'app-5': ['1'],
  'app-6': ['1'],
  'app-7': ['1'],
  'app-8': ['1'],
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      apps: INITIAL_APPS,
      permissions: INITIAL_PERMISSIONS,

      addApp: (app) =>
        set((state) => ({
          apps: [...state.apps, { ...app, id: `app-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }],
          permissions: { ...state.permissions, [app.id]: ['1'] },
        })),

      updateApp: (id, data) =>
        set((state) => ({
          apps: state.apps.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      deleteApp: (id) =>
        set((state) => {
          const perms = { ...state.permissions }
          delete perms[id]
          return { apps: state.apps.filter((a) => a.id !== id), permissions: perms }
        }),

      toggleAppActive: (id) =>
        set((state) => ({
          apps: state.apps.map((a) =>
            a.id === id ? { ...a, active: !a.active } : a
          ),
        })),

      getUserApps: (userId) => {
        const { apps, permissions } = get()
        return apps.map((app) => ({
          ...app,
          hasAccess: permissions[app.id]?.includes(userId) ?? false,
        }))
      },

      grantAccess: (appId, userId) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [appId]: [...new Set([...(state.permissions[appId] || []), userId])],
          },
        })),

      revokeAccess: (appId, userId) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [appId]: (state.permissions[appId] || []).filter((id) => id !== userId),
          },
        })),

      setAppPermissions: (appId, userIds) =>
        set((state) => ({
          permissions: { ...state.permissions, [appId]: userIds },
        })),
    }),
    { name: 'mfe-apps' }
  )
)
