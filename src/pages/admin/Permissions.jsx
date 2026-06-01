import { useState } from 'react'
import { Check, X, Search, Shield, Info } from 'lucide-react'
import Header from '../../components/Header'
import AppIcon from '../../components/AppIcon'
import { useAppStore } from '../../store/useAppStore'
import { useUserStore } from '../../store/useUserStore'

function AvatarBubble({ name }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  const colors = ['bg-brand-600', 'bg-violet-600', 'bg-emerald-600', 'bg-orange-500', 'bg-rose-500']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div className={`w-7 h-7 ${color} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function AdminPermissions() {
  const { apps, permissions, grantAccess, revokeAccess } = useAppStore()
  const { users } = useUserStore()
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('all')

  const activeApps = apps.filter((a) => a.active)
  const activeUsers = users.filter((u) => u.active)

  const filteredUsers = activeUsers.filter(
    (u) =>
      (filterUser === 'all' || u.id === filterUser) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const hasAccess = (userId, appId) => permissions[appId]?.includes(userId) ?? false

  const togglePermission = (userId, appId) => {
    if (hasAccess(userId, appId)) {
      revokeAccess(appId, userId)
    } else {
      grantAccess(appId, userId)
    }
  }

  const grantAll = (userId) => {
    activeApps.forEach((app) => grantAccess(app.id, userId))
  }

  const revokeAll = (userId) => {
    activeApps.forEach((app) => revokeAccess(app.id, userId))
  }

  const getUserAppCount = (userId) =>
    activeApps.filter((app) => hasAccess(userId, app.id)).length

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Controle de Permissões" subtitle="Configure quais usuários têm acesso a cada aplicação" />

      <div className="p-6 space-y-5">
        {/* Info */}
        <div className="flex items-start gap-2.5 p-3.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-800">
          <Info size={16} className="flex-shrink-0 mt-0.5 text-brand-500" />
          <p>Clique nas células da matriz para conceder ou revogar acesso. Usuários sem acesso verão o app em cinza com opção de solicitar degustação.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 py-1.5 text-sm"
              placeholder="Filtrar usuários..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input py-1.5 text-sm max-w-[180px]"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="all">Todos os usuários</option>
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Matrix */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[200px]">
                  Usuário
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  Apps
                </th>
                {activeApps.map((app) => (
                  <th key={app.id} className="px-3 py-3 min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                        <AppIcon name={app.icon} size={13} className="text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 leading-tight text-center max-w-[70px]">
                        {app.name}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center min-w-[100px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarBubble name={user.name} />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      getUserAppCount(user.id) > 0
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {getUserAppCount(user.id)}/{activeApps.length}
                    </span>
                  </td>
                  {activeApps.map((app) => {
                    const has = hasAccess(user.id, app.id)
                    return (
                      <td key={app.id} className="px-3 py-3 text-center">
                        <button
                          onClick={() => togglePermission(user.id, app.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all border ${
                            has
                              ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500'
                          }`}
                          title={has ? 'Revogar acesso' : 'Conceder acesso'}
                        >
                          {has ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2} />}
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => grantAll(user.id)}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium border border-emerald-200"
                        title="Liberar todos"
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => revokeAll(user.id)}
                        className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium border border-red-200"
                        title="Revogar todos"
                      >
                        Nenhum
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
              <Check size={11} className="text-white" strokeWidth={3} />
            </div>
            Acesso concedido
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded border border-slate-200 bg-white flex items-center justify-center">
              <X size={11} className="text-slate-300" />
            </div>
            Sem acesso
          </div>
        </div>
      </div>
    </div>
  )
}
