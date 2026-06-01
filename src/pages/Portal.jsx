import { useState } from 'react'
import { ExternalLink, Lock, Unlock, Search, Filter, Send, CheckCircle } from 'lucide-react'
import Header from '../components/Header'
import AppIcon from '../components/AppIcon'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { useRequestStore } from '../store/useRequestStore'

const CATEGORIES = ['Todos', 'Analytics', 'CRM', 'ERP', 'RH', 'Marketing', 'Logística', 'TI', 'Jurídico']

function AppCard({ app, hasAccess, onRequestAccess }) {
  const handleOpen = () => {
    if (hasAccess && app.active) window.open(app.url, '_blank', 'noopener')
  }

  const isAvailable = hasAccess && app.active
  const isDisabled = !app.active

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col ${
        isAvailable
          ? 'bg-white border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
          : 'bg-white border-slate-100 shadow-card'
      } ${isDisabled ? 'opacity-60' : ''}`}
      onClick={isAvailable ? handleOpen : undefined}
    >
      {/* Color header */}
      <div
        className={`h-24 bg-gradient-to-br ${
          isAvailable ? app.color : 'from-slate-300 to-slate-400'
        } relative flex items-center justify-center`}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }} />
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isAvailable ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/30'
        }`}>
          <AppIcon
            name={app.icon}
            size={22}
            className={isAvailable ? 'text-white' : 'text-slate-500'}
          />
        </div>

        {/* Status badge top-right */}
        <div className="absolute top-2.5 right-2.5">
          {!app.active ? (
            <span className="badge-gray text-[10px]">Inativo</span>
          ) : isAvailable ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white border border-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Disponível
            </span>
          ) : (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-black/20 text-white/80 border border-white/20">
              <Lock size={9} />
              Restrito
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className={`font-semibold text-sm leading-tight ${
            isAvailable ? 'text-slate-800' : 'text-slate-500'
          }`}>
            {app.name}
          </h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
            isAvailable ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-400'
          }`}>
            {app.category}
          </span>
        </div>
        <p className={`text-xs leading-relaxed flex-1 ${
          isAvailable ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {app.description}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-50">
          {isAvailable ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Unlock size={11} />
                <span>Acesso liberado</span>
              </div>
              <div className="flex items-center gap-1 text-brand-600 text-xs font-medium">
                <span>Abrir</span>
                <ExternalLink size={12} />
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRequestAccess(app)
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all duration-150"
            >
              <Send size={11} />
              Solicitar Degustação
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function RequestModal({ app, open, onClose }) {
  const { currentUser } = useAuthStore()
  const { submitRequest, getUserRequests } = useRequestStore()
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const userRequests = getUserRequests(currentUser?.id || '')
  const existingRequest = userRequests.find(
    (r) => r.appId === app?.id && r.status === 'pending'
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = submitRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      appId: app.id,
      appName: app.name,
      message,
    })
    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error)
    }
  }

  const handleClose = () => {
    setMessage('')
    setSubmitted(false)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Solicitar acesso — ${app?.name}`} size="sm">
      {submitted || existingRequest ? (
        <div className="text-center py-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">Solicitação enviada!</h3>
          <p className="text-sm text-slate-500">
            Sua solicitação de degustação para <strong>{app?.name}</strong> foi enviada. O administrador irá revisá-la em breve.
          </p>
          <button onClick={handleClose} className="btn-primary mt-5 mx-auto">
            Entendido
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`h-12 rounded-xl bg-gradient-to-br ${app?.color} flex items-center gap-3 px-4`}>
            <AppIcon name={app?.icon} size={20} className="text-white" />
            <div>
              <p className="text-white text-sm font-semibold leading-none">{app?.name}</p>
              <p className="text-white/70 text-xs">{app?.category}</p>
            </div>
          </div>

          <div>
            <label className="label">Por que você precisa deste app? (opcional)</label>
            <textarea
              className="input resize-none h-24"
              placeholder="Descreva brevemente seu caso de uso..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Send size={15} /> Enviar Solicitação
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function Portal() {
  const { currentUser } = useAuthStore()
  const { getUserApps } = useAppStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [requestApp, setRequestApp] = useState(null)

  const allApps = getUserApps(currentUser?.id || '')

  const filtered = allApps.filter((app) => {
    const matchSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'Todos' || app.category === category
    return matchSearch && matchCategory
  })

  const available = filtered.filter((a) => a.hasAccess && a.active)
  const restricted = filtered.filter((a) => !a.hasAccess || !a.active)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Portal de Aplicações"
        subtitle={`Olá, ${currentUser?.name?.split(' ')[0]}! Selecione um app para começar.`}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Buscar aplicações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  category === cat
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Available apps */}
        {available.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-slate-700">Seus Aplicativos</h2>
              <span className="badge-green">{available.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {available.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  hasAccess={true}
                  onRequestAccess={setRequestApp}
                />
              ))}
            </div>
          </section>
        )}

        {/* Restricted apps */}
        {restricted.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-slate-500">Outros Aplicativos</h2>
              <span className="badge-gray">{restricted.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restricted.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  hasAccess={app.hasAccess}
                  onRequestAccess={setRequestApp}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum app encontrado</p>
            <p className="text-slate-400 text-sm">Tente outros filtros ou termos de busca</p>
          </div>
        )}
      </div>

      <RequestModal
        app={requestApp}
        open={!!requestApp}
        onClose={() => setRequestApp(null)}
      />
    </div>
  )
}
