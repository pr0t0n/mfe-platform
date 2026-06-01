import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, RefreshCw, AlertTriangle, LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import AppIcon from '../components/AppIcon'

export default function AppViewer() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { getUserApps } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const apps = getUserApps(currentUser?.id || '')
  const app = apps.find((a) => a.id === appId)

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#fcfbf8' }}>
        <AlertTriangle size={32} style={{ color: '#e96363' }} className="mb-3" />
        <p className="text-lg font-semibold" style={{ color: '#1c1c1c' }}>App não encontrado</p>
        <button onClick={() => navigate('/portal')} className="btn-secondary mt-4">
          <ArrowLeft size={15} /> Voltar ao portal
        </button>
      </div>
    )
  }

  if (!app.hasAccess || !app.active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#fcfbf8' }}>
        <AlertTriangle size={32} style={{ color: '#e96363' }} className="mb-3" />
        <p className="text-lg font-semibold" style={{ color: '#1c1c1c' }}>Sem acesso a este app</p>
        <button onClick={() => navigate('/portal')} className="btn-secondary mt-4">
          <ArrowLeft size={15} /> Voltar ao portal
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{
          background: 'rgba(252,251,248,0.95)',
          borderBottom: '1px solid #e5dcd5',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded transition-all"
          style={{ color: '#6b6b6b', border: '1px solid #e5dcd5' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0ebe7'; e.currentTarget.style.color = '#1c1c1c' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}
        >
          <LayoutGrid size={13} strokeWidth={1.7} />
          Portal
        </button>

        <span style={{ color: '#e5dcd5' }}>/</span>

        {/* App identity */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${app.color}`}
          >
            <AppIcon name={app.icon} size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-none truncate" style={{ color: '#1c1c1c' }}>
              {app.name}
            </p>
            <p className="font-mono text-[10.5px] truncate mt-0.5" style={{ color: '#6b6b6b' }}>
              {app.url}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {loading && (
            <span className="font-mono text-[10.5px] flex items-center gap-1.5" style={{ color: '#6b6b6b' }}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#e96363', animation: 'pulse-dot 1.2s ease-in-out infinite' }}
              />
              Carregando…
            </span>
          )}
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="w-8 h-8 flex items-center justify-center rounded transition-all"
            style={{ border: '1px solid #e5dcd5', color: '#6b6b6b' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0ebe7' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title="Recarregar"
          >
            <RefreshCw size={13} strokeWidth={1.7} />
          </button>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded transition-all"
            style={{ border: '1px solid #e5dcd5', color: '#6b6b6b' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0ebe7' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title="Abrir em nova aba"
          >
            <ExternalLink size={13} strokeWidth={1.7} />
          </a>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: '#fcfbf8' }}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${app.color}`}
            >
              <AppIcon name={app.icon} size={28} className="text-white" />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: '#1c1c1c' }}>
              Abrindo {app.name}
            </p>
            <p className="font-mono text-[11.5px]" style={{ color: '#6b6b6b' }}>{app.url}</p>
          </div>
        )}
        <iframe
          key={reloadKey}
          src={app.url}
          title={app.name}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  )
}
