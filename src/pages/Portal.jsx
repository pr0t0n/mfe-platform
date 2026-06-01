import { useState } from 'react'
import { ExternalLink, Lock, Send, CheckCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import AppIcon from '../components/AppIcon'
import Modal from '../components/Modal'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { useRequestStore } from '../store/useRequestStore'

const CATEGORIES = ['Todos', 'Analytics', 'CRM', 'ERP', 'RH', 'Marketing', 'Logística', 'TI', 'Jurídico']

function AppCard({ app, hasAccess, onRequestAccess }) {
  const navigate = useNavigate()
  const isAvailable = hasAccess && app.active
  const isDisabled = !app.active

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden transition-all duration-200 ${
        isAvailable ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${isDisabled ? 'opacity-50' : ''}`}
      style={{
        background: '#fff',
        border: '1px solid #e5dcd5',
        boxShadow: '0 1px 2px rgba(28,28,28,0.04), 0 4px 12px rgba(28,28,28,0.04)',
      }}
      onClick={() => isAvailable && navigate(`/app/${app.id}`)}
      onMouseEnter={(e) => {
        if (isAvailable) e.currentTarget.style.boxShadow = '0 2px 6px rgba(28,28,28,0.06), 0 8px 24px rgba(28,28,28,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(28,28,28,0.04), 0 4px 12px rgba(28,28,28,0.04)'
      }}
    >
      {/* Color header */}
      <div
        className={`h-20 relative flex items-center justify-center bg-gradient-to-br ${
          isAvailable ? app.color : 'from-[#c9c9c9] to-[#a8a8a8]'
        }`}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }}
        >
          <AppIcon
            name={app.icon}
            size={20}
            className={isAvailable ? 'text-white' : 'text-white/70'}
          />
        </div>

        {/* Status pill */}
        <div className="absolute top-2.5 right-2.5">
          {!app.active ? (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.7)' }}
            >
              inativo
            </span>
          ) : isAvailable ? (
            <span
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              online
            </span>
          ) : (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.7)' }}
            >
              <Lock size={9} /> restrito
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-semibold text-[13.5px] leading-tight"
            style={{ color: isAvailable ? '#1c1c1c' : '#6b6b6b', letterSpacing: '-0.01em' }}
          >
            {app.name}
          </h3>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 font-mono"
            style={{
              background: isAvailable ? 'rgba(233,99,99,0.08)' : '#f0ebe7',
              color: isAvailable ? '#a83232' : '#6b6b6b',
            }}
          >
            {app.category}
          </span>
        </div>
        <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: isAvailable ? '#6b6b6b' : '#a8a8a8' }}>
          {app.description}
        </p>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #efe7e0' }}>
          {isAvailable ? (
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px]" style={{ color: '#6b6b6b' }}>
                Clique para abrir
              </span>
              <span
                className="flex items-center gap-1 text-[12px] font-semibold"
                style={{ color: '#e96363' }}
              >
                Abrir <ExternalLink size={11} />
              </span>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onRequestAccess(app) }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded transition-all duration-150"
              style={{ border: '1px solid #e5dcd5', color: '#6b6b6b', background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e96363'; e.currentTarget.style.color = '#e96363'; e.currentTarget.style.background = 'rgba(233,99,99,0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5dcd5'; e.currentTarget.style.color = '#6b6b6b'; e.currentTarget.style.background = 'transparent' }}
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

  const existing = getUserRequests(currentUser?.id || '').find(
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
    if (result.success) setSubmitted(true)
    else setError(result.error)
  }

  const handleClose = () => { setMessage(''); setSubmitted(false); setError(''); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title={`Solicitar acesso — ${app?.name}`} size="sm">
      {submitted || existing ? (
        <div className="text-center py-4 animate-fadeIn">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(34,145,96,0.10)' }}
          >
            <CheckCircle size={24} style={{ color: '#229160' }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: '#1c1c1c' }}>Solicitação enviada!</h3>
          <p className="text-[13px]" style={{ color: '#6b6b6b' }}>
            Sua solicitação de degustação para <strong>{app?.name}</strong> foi enviada.
            O administrador irá revisá-la em breve.
          </p>
          <button onClick={handleClose} className="btn-primary mt-5 mx-auto">
            Entendido
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`h-12 rounded-xl flex items-center gap-3 px-4 bg-gradient-to-br ${app?.color}`}
          >
            <AppIcon name={app?.icon} size={18} className="text-white" />
            <div>
              <p className="text-white text-[13px] font-semibold leading-none">{app?.name}</p>
              <p className="text-white/70 text-[10.5px] font-mono">{app?.category}</p>
            </div>
          </div>

          <div>
            <label className="label">Por que você precisa deste app? (opcional)</label>
            <textarea
              className="input resize-none h-24"
              style={{ fontFamily: 'inherit', fontSize: '13.5px' }}
              placeholder="Descreva brevemente seu caso de uso..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-[13px] px-3 py-2 rounded" style={{ color: '#b03333', background: 'rgba(214,69,69,0.08)', border: '1px solid rgba(214,69,69,0.25)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <Send size={14} /> Enviar Solicitação
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
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Todos' || app.category === category
    return matchSearch && matchCat
  })

  const available = filtered.filter((a) => a.hasAccess && a.active)
  const restricted = filtered.filter((a) => !a.hasAccess || !a.active)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        eyebrow="Portal"
        title="Aplicações"
        subtitle={`Olá, ${currentUser?.name?.split(' ')[0]} — ${available.length} app${available.length !== 1 ? 's' : ''} disponível${available.length !== 1 ? 'is' : ''}`}
      />

      <div className="flex-1 px-10 py-8 space-y-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6b6b6b', strokeWidth: 1.6 }} />
            <input
              className="input pl-9 text-[13px]"
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
                className="px-3 py-1.5 rounded text-[12px] font-medium transition-all"
                style={{
                  background: category === cat ? '#e96363' : '#fff',
                  color: category === cat ? '#fff' : '#3d3d3d',
                  border: `1px solid ${category === cat ? '#e96363' : '#e5dcd5'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Available */}
        {available.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[13px] font-semibold" style={{ color: '#3d3d3d', letterSpacing: '-0.01em' }}>
                Seus Aplicativos
              </h2>
              <span className="badge-green">{available.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {available.map((app) => (
                <AppCard key={app.id} app={app} hasAccess={true} onRequestAccess={setRequestApp} />
              ))}
            </div>
          </section>
        )}

        {/* Restricted */}
        {restricted.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[13px] font-semibold" style={{ color: '#6b6b6b' }}>
                Outros Aplicativos
              </h2>
              <span className="badge-gray">{restricted.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {restricted.map((app) => (
                <AppCard key={app.id} app={app} hasAccess={app.hasAccess} onRequestAccess={setRequestApp} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <Search size={28} className="mx-auto mb-3" style={{ color: '#d8cdc4' }} />
            <p className="font-semibold" style={{ color: '#3d3d3d' }}>Nenhum app encontrado</p>
            <p className="text-[13px] mt-1" style={{ color: '#6b6b6b' }}>Tente outros filtros ou termos de busca</p>
          </div>
        )}
      </div>

      <RequestModal app={requestApp} open={!!requestApp} onClose={() => setRequestApp(null)} />
    </div>
  )
}
