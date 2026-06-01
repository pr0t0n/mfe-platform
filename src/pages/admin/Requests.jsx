import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Search, Inbox, UserCircle, AppWindow } from 'lucide-react'
import Header from '../../components/Header'
import AppIcon from '../../components/AppIcon'
import { useRequestStore } from '../../store/useRequestStore'
import { useAppStore } from '../../store/useAppStore'

const STATUS_MAP = {
  pending: { label: 'Pendente', class: 'badge-yellow', icon: Clock },
  approved: { label: 'Aprovado', class: 'badge-green', icon: CheckCircle },
  rejected: { label: 'Rejeitado', class: 'badge-red', icon: XCircle },
}

export default function AdminRequests() {
  const { requests, approveRequest, rejectRequest } = useRequestStore()
  const { apps, grantAccess } = useAppStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.appName.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter
    return matchSearch && matchFilter
  })

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const handleApprove = (request) => {
    approveRequest(request.id)
    grantAccess(request.appId, request.userId)
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const getApp = (appId) => apps.find((a) => a.id === appId)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Solicitações de Acesso"
        subtitle="Gerencie pedidos de degustação dos usuários"
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pendentes', value: requests.filter((r) => r.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Aprovadas', value: requests.filter((r) => r.status === 'approved').length, color: 'text-emerald-600' },
            { label: 'Rejeitadas', value: requests.filter((r) => r.status === 'rejected').length, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="card px-4 py-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 py-1.5 text-sm"
              placeholder="Buscar por usuário ou app..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === f
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {f === 'all' ? 'Todas' : STATUS_MAP[f]?.label}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1 py-0.5 text-[10px] rounded-full bg-red-500 text-white font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {sorted.length === 0 ? (
          <div className="card py-16 text-center animate-fadeIn">
            <Inbox size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma solicitação encontrada</p>
            <p className="text-slate-400 text-sm">Quando usuários solicitarem degustação, aparecerá aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((req) => {
              const app = getApp(req.appId)
              const StatusIcon = STATUS_MAP[req.status]?.icon || Clock
              return (
                <div
                  key={req.id}
                  className={`card p-4 animate-fadeIn ${
                    req.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* App icon */}
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app?.color || 'from-slate-400 to-slate-500'} flex items-center justify-center flex-shrink-0`}>
                      <AppIcon name={app?.icon || 'Globe'} size={20} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800">{req.userName}</p>
                            <span className="text-slate-400 text-xs">solicitou acesso a</span>
                            <p className="font-semibold text-slate-800">{req.appName}</p>
                            <span className={STATUS_MAP[req.status]?.class}>
                              <StatusIcon size={10} />
                              {STATUS_MAP[req.status]?.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(req.createdAt)}</p>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleApprove(req)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                            >
                              <CheckCircle size={13} /> Aprovar
                            </button>
                            <button
                              onClick={() => rejectRequest(req.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-600 text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <XCircle size={13} /> Rejeitar
                            </button>
                          </div>
                        )}
                      </div>

                      {req.message && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-medium text-slate-500">Justificativa: </span>
                            {req.message}
                          </p>
                        </div>
                      )}

                      {req.resolvedAt && (
                        <p className="text-xs text-slate-400 mt-1.5">
                          {req.status === 'approved' ? 'Aprovado' : 'Rejeitado'} em {formatDate(req.resolvedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
