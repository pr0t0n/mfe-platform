import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, RefreshCw, AlertTriangle, LayoutGrid, ShieldX, Copy, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import AppIcon from '../components/AppIcon'

const LOAD_TIMEOUT_MS = 8000

function XFrameError({ app }) {
  const [copied, setCopied] = useState(false)

  const nginxSnippet = `# Adicione no servidor de ${app.name}:
add_header X-Frame-Options "ALLOWFROM https://seu-hub.domain.com";
# Ou (mais moderno, recomendado):
add_header Content-Security-Policy "frame-ancestors 'self' https://seu-hub.domain.com";`

  const copy = () => {
    navigator.clipboard.writeText(nginxSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12" style={{ background: '#fcfbf8' }}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(233,99,99,0.10)', border: '1px solid rgba(233,99,99,0.25)' }}
      >
        <ShieldX size={30} style={{ color: '#e96363' }} />
      </div>

      <h2 className="text-[20px] font-semibold mb-2 text-center" style={{ color: '#1c1c1c', letterSpacing: '-0.015em' }}>
        Embedding bloqueado pelo servidor
      </h2>
      <p className="text-[13.5px] text-center mb-1 max-w-md" style={{ color: '#6b6b6b', lineHeight: '1.6' }}>
        <strong style={{ color: '#1c1c1c' }}>{app.name}</strong> retornou o header{' '}
        <code className="font-mono text-[12px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(233,99,99,0.08)', color: '#a83232' }}>
          X-Frame-Options: SAMEORIGIN
        </code>
        , que impede o browser de exibi-lo dentro de um iframe de outro domínio.
      </p>
      <p className="text-[12.5px] text-center mb-8 max-w-md" style={{ color: '#6b6b6b' }}>
        Este é um mecanismo de segurança do navegador — não é possível contorná-lo pelo frontend.
      </p>

      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mb-8"
      >
        <ExternalLink size={15} /> Abrir {app.name} em nova aba
      </a>

      {/* Fix guide */}
      <div
        className="w-full max-w-lg rounded-xl p-5"
        style={{ background: '#fff', border: '1px solid #e5dcd5', boxShadow: '0 1px 4px rgba(28,28,28,0.06)' }}
      >
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#6b6b6b' }}>
          Para habilitar o embedding — configurar no servidor de {app.name}
        </p>
        <div className="relative">
          <pre
            className="font-mono text-[11.5px] p-3.5 rounded-lg overflow-x-auto leading-relaxed"
            style={{ background: '#16191f', color: '#d6dae3' }}
          >
            <code>{nginxSnippet}</code>
          </pre>
          <button
            onClick={copy}
            className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#a8b1c0', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
          </button>
        </div>
        <p className="text-[11px] mt-3" style={{ color: '#6b6b6b' }}>
          Após configurar, recarregue esta página. Apps que você <strong>não controla</strong> (terceiros) só podem ser abertos em nova aba.
        </p>
      </div>
    </div>
  )
}

export default function AppViewer() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { data: apps } = useApi(() => api.getApps())
  const [frameState, setFrameState] = useState('loading') // loading | ok | blocked
  const [reloadKey, setReloadKey] = useState(0)
  const timeoutRef = useRef(null)
  const iframeRef = useRef(null)

  const app = (apps || []).find(a => a.id === appId)

  useEffect(() => {
    setFrameState('loading')
    // Se após LOAD_TIMEOUT_MS o onLoad não disparou OU o iframe está vazio,
    // assume X-Frame-Options bloqueou
    timeoutRef.current = setTimeout(() => {
      try {
        // Tenta acessar contentDocument — lança exceção se cross-origin bloqueado
        const doc = iframeRef.current?.contentDocument
        if (!doc || !doc.body || doc.body.innerHTML === '') {
          setFrameState('blocked')
        }
      } catch {
        setFrameState('blocked')
      }
    }, LOAD_TIMEOUT_MS)

    return () => clearTimeout(timeoutRef.current)
  }, [reloadKey, appId])

  const handleLoad = () => {
    clearTimeout(timeoutRef.current)
    try {
      // Acesso a contentDocument lança SecurityError se X-Frame-Options bloqueou
      const doc = iframeRef.current?.contentDocument
      if (!doc || doc.location?.href === 'about:blank') {
        setFrameState('blocked')
      } else {
        setFrameState('ok')
      }
    } catch {
      // SecurityError = X-Frame-Options bloqueou (cross-origin sem permissão)
      setFrameState('blocked')
    }
  }

  const handleError = () => {
    clearTimeout(timeoutRef.current)
    setFrameState('blocked')
  }

  if (!apps) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#fcfbf8' }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#e96363', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!app || !app.hasAccess || !app.active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#fcfbf8' }}>
        <AlertTriangle size={32} style={{ color: '#e96363' }} className="mb-3" />
        <p className="text-[15px] font-semibold mb-3" style={{ color: '#1c1c1c' }}>
          {!app ? 'App não encontrado' : 'Sem acesso a este app'}
        </p>
        <button onClick={() => navigate('/portal')} className="btn-secondary">
          <ArrowLeft size={14} /> Voltar ao portal
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App bar */}
      <div
        className="flex items-center gap-3 px-5 py-2.5 flex-shrink-0"
        style={{ background: 'rgba(252,251,248,0.95)', borderBottom: '1px solid #e5dcd5', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded transition-all"
          style={{ color: '#6b6b6b', border: '1px solid #e5dcd5' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f0ebe7'; e.currentTarget.style.color = '#1c1c1c' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}
        >
          <LayoutGrid size={12} strokeWidth={1.7} /> Portal
        </button>

        <span style={{ color: '#e5dcd5' }}>/</span>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${app.color}`}>
            <AppIcon name={app.icon} size={12} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-none truncate" style={{ color: '#1c1c1c' }}>{app.name}</p>
            <p className="font-mono text-[10px] truncate mt-0.5" style={{ color: '#6b6b6b' }}>{app.url}</p>
          </div>
        </div>

        {/* Status indicator */}
        {frameState === 'loading' && (
          <span className="flex items-center gap-1.5 font-mono text-[10.5px]" style={{ color: '#6b6b6b' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e96363', animation: 'pulse-dot 1.2s ease-in-out infinite' }} />
            Carregando…
          </span>
        )}
        {frameState === 'blocked' && (
          <span className="flex items-center gap-1.5 font-mono text-[10.5px] px-2 py-0.5 rounded" style={{ background: 'rgba(233,99,99,0.10)', color: '#a83232', border: '1px solid rgba(233,99,99,0.25)' }}>
            <ShieldX size={11} /> X-Frame-Options bloqueado
          </span>
        )}
        {frameState === 'ok' && (
          <span className="flex items-center gap-1.5 font-mono text-[10.5px]" style={{ color: '#1f8a59' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
          </span>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setFrameState('loading'); setReloadKey(k => k + 1) }}
            className="w-7 h-7 flex items-center justify-center rounded transition-all"
            style={{ border: '1px solid #e5dcd5', color: '#6b6b6b' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0ebe7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Recarregar"
          >
            <RefreshCw size={12} strokeWidth={1.7} />
          </button>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded transition-all"
            style={{ border: '1px solid #e5dcd5', color: '#6b6b6b' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0ebe7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Abrir em nova aba"
          >
            <ExternalLink size={12} strokeWidth={1.7} />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {frameState === 'blocked' ? (
          <XFrameError app={app} />
        ) : (
          <>
            {frameState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: '#fcfbf8' }}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br ${app.color}`}>
                  <AppIcon name={app.icon} size={24} className="text-white" />
                </div>
                <p className="text-[13.5px] font-semibold mb-0.5" style={{ color: '#1c1c1c' }}>Abrindo {app.name}</p>
                <p className="font-mono text-[11px]" style={{ color: '#6b6b6b' }}>{app.url}</p>
              </div>
            )}
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={app.url}
              title={app.name}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              allow="fullscreen"
            />
          </>
        )}
      </div>
    </div>
  )
}
