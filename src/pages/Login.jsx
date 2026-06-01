import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const TERMINAL_LINES = [
  { cls: '', parts: [{ cls: 'text-[#e96363]', t: '$ ' }, { cls: '', t: 'auth --sso cyberops.valid.com.br' }] },
  { cls: '', parts: [{ cls: 'text-[#6b7384]', t: '[ldap]  ' }, { cls: 'text-[#4ade80]', t: 'sync OK · 312 contas' }] },
  { cls: '', parts: [{ cls: 'text-[#6b7384]', t: '[mfa]   ' }, { cls: 'text-[#4ade80]', t: 'TOTP validado' }] },
  { cls: '', parts: [{ cls: 'text-[#6b7384]', t: '[rbac]  ' }, { cls: 'text-[#fb923c]', t: '8 apps · 3 perfis ativos' }] },
  { cls: 'mt-1.5', parts: [{ cls: 'text-[#e96363]', t: '$ ' }, { cls: '', t: 'apps --list --status' }] },
  { cls: '', parts: [{ cls: 'text-[#6b7384]', t: '[hub]   ' }, { cls: 'text-[#4ade80]', t: '8/8 micro-frontends online' }] },
  { cls: '', parts: [{ cls: 'text-[#6b7384]', t: '[rbac]  ' }, { cls: 'text-[#4ade80]', t: 'ACLs sincronizadas' }] },
  { cls: 'mt-1.5', parts: [{ cls: 'text-[#e96363]', t: '$ ' }, { cls: 'blink', t: 'session --open --audit' }] },
]

export default function Login() {
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/portal" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const result = login(email, password)
    if (result.success) navigate('/portal')
    else setError(result.error)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen grid"
      style={{ gridTemplateColumns: '1.05fr 0.95fr' }}
    >
      {/* ── LEFT · PITCH ── */}
      <aside
        className="relative flex flex-col px-14 py-14 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 18% 22%, rgba(233,99,99,0.28), transparent 52%), radial-gradient(circle at 88% 86%, rgba(75,115,255,0.16), transparent 48%), linear-gradient(165deg,#1a1f27 0%,#0f1218 100%)',
          color: '#f1eee8',
        }}
      >
        {/* grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 40%,#000 30%,transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 40%,#000 30%,transparent 75%)',
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: '#e96363', boxShadow: '0 0 0 4px rgba(233,99,99,0.18)' }}
          />
          <div>
            <p className="font-bold text-lg leading-none text-white" style={{ letterSpacing: '-0.018em' }}>
              CyberOps<span style={{ color: '#e96363' }}>HUB</span>
            </p>
            <p className="font-mono text-[9.5px] tracking-[0.18em] uppercase mt-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Plataforma de Cyber Security VALID
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 mt-auto pt-20 max-w-lg">
          <div
            className="flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-5 font-mono"
            style={{ color: '#e96363' }}
          >
            <span className="w-7 h-px flex-shrink-0" style={{ background: '#e96363' }} />
            Console operacional · v3.1
          </div>
          <h1
            className="text-5xl font-semibold text-white mb-5"
            style={{ letterSpacing: '-0.028em', lineHeight: '1.02' }}
          >
            Seus sistemas,<br />
            <em className="not-italic font-semibold" style={{ color: '#e96363' }}>
              governados em um só lugar.
            </em>
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)', maxWidth: '460px' }}>
            Acesso centralizado a todos os micro-frontends corporativos com controle de perfil,
            auditoria e solicitação de degustação por app.
          </p>

          {/* Terminal */}
          <div
            className="mt-10 rounded-[10px] overflow-hidden max-w-[460px]"
            style={{
              background: 'rgba(15,18,24,0.65)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '11.5px',
              lineHeight: '1.6',
              color: '#d6dae3',
            }}
          >
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 text-[10.5px] tracking-[0.04em]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#7a8294' }}
            >
              <span className="flex gap-1.5">
                {['#2a323d','#2a323d','#2a323d'].map((c,i) => (
                  <i key={i} className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
                ))}
              </span>
              hub.cyberops.valid.com.br · session
            </div>
            <div className="px-4 py-3 space-y-0.5">
              {TERMINAL_LINES.map((line, i) => (
                <span key={i} className={`block ${line.cls}`}>
                  {line.parts.map((p, j) => (
                    <span key={j} className={p.cls}>{p.t}</span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative z-10 mt-auto pt-10 flex justify-between text-[10.5px] font-mono"
          style={{ color: 'rgba(255,255,255,0.38)' }}
        >
          <span>v3.1.0 · build c7a2e</span>
          <span>TLS 1.3 · sessão auditada</span>
        </div>
      </aside>

      {/* ── RIGHT · FORM ── */}
      <main className="flex items-center justify-center px-14 py-14 bg-white">
        <form className="w-full max-w-[380px]" onSubmit={handleSubmit}>
          <div className="eyebrow mb-4">Acesso restrito</div>

          <h2
            className="text-[32px] font-semibold mb-1.5 leading-tight"
            style={{ letterSpacing: '-0.022em', color: '#1c1c1c' }}
          >
            Bem-vindo de volta.
          </h2>
          <p className="text-[13.5px] mb-8" style={{ color: '#6b6b6b', lineHeight: '1.5' }}>
            Faça login para acessar os sistemas e aplicações.
          </p>

          {/* Email */}
          <div className="mb-3.5">
            <label className="label">Email corporativo</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6b6b6b', strokeWidth: 1.6 }} />
              <input
                type="email"
                className="input pl-10"
                style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13.5px' }}
                placeholder="alice@valid.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Senha</label>
              <a href="#" className="font-mono text-[11px] font-medium" style={{ color: '#a83232' }}>
                esqueci a senha
              </a>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6b6b6b', strokeWidth: 1.6 }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="input pl-10 pr-12"
                style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13.5px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10.5px] font-mono font-semibold tracking-wide"
                style={{ color: '#6b6b6b' }}
              >
                {showPass ? 'ocultar' : 'mostrar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded text-sm animate-fadeIn" style={{ background: 'rgba(214,69,69,0.08)', border: '1px solid rgba(214,69,69,0.25)', color: '#b03333' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center text-[14px] py-3" disabled={loading}>
            {loading ? 'Autenticando...' : (
              <><span>Entrar no console</span><ArrowRight size={15} strokeWidth={2} /></>
            )}
          </button>

          {/* SSO */}
          <div
            className="flex items-center gap-3 my-6 text-[10.5px] tracking-[0.12em] uppercase font-mono"
            style={{ color: '#6b6b6b' }}
          >
            <span className="flex-1 h-px" style={{ background: '#e5dcd5' }} />
            ou continue com
            <span className="flex-1 h-px" style={{ background: '#e5dcd5' }} />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Okta SSO', colors: 'linear-gradient(135deg,#007dc1,#003a6b)' },
              { label: 'Azure AD', colors: 'linear-gradient(135deg,#0078d4,#004b8d)' },
            ].map(({ label, colors }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-semibold rounded transition-all"
                style={{ background: '#fff', border: '1px solid #e5dcd5', color: '#3d3d3d' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d8cdc4'; e.currentTarget.style.background = '#f0ebe7' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5dcd5'; e.currentTarget.style.background = '#fff' }}
              >
                <span className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0" style={{ background: colors }} />
                {label}
              </button>
            ))}
          </div>

          {/* Audit notice */}
          <div
            className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-[10.5px]"
            style={{ background: 'rgba(34,145,96,0.10)', border: '1px solid rgba(34,145,96,0.25)', color: '#1f8a59' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#229160', animation: 'pulse-dot 2.4s ease-in-out infinite' }}
            />
            Todas as ações nesta sessão são auditadas
          </div>

          <p className="mt-5 text-[11.5px] leading-relaxed" style={{ color: '#6b6b6b' }}>
            Ao fazer login você concorda com os{' '}
            <a href="#" style={{ color: '#a83232', fontWeight: 500 }}>termos de uso</a>{' '}
            e a{' '}
            <a href="#" style={{ color: '#a83232', fontWeight: 500 }}>política de retenção</a>{' '}
            da VALID. Sub-processadores listados conforme LGPD.
          </p>
        </form>
      </main>
    </div>
  )
}
