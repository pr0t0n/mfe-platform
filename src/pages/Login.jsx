import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppWindow, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/portal" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const result = login(email, password)
    if (result.success) {
      navigate('/portal')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const quickLogin = (e, p) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-slate-900 to-brand-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 pt-8 pb-10 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-2xl mb-3 backdrop-blur-sm">
                <AppWindow size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">MFE Hub</h1>
              <p className="text-brand-200 text-sm">Plataforma de Micro Frontends</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm mb-6">Faça login para acessar a plataforma</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">E-mail corporativo</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fadeIn">
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-2.5 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} /> Entrar
                  </>
                )}
              </button>
            </form>

            {/* Quick access hint */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">Acesso rápido para demonstração</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('admin@empresa.com', 'admin123')}
                  className="text-xs px-3 py-2 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors font-medium"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('joao@empresa.com', '123456')}
                  className="text-xs px-3 py-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors font-medium"
                >
                  Usuário Padrão
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2025 MFE Hub — Plataforma Corporativa Interna
        </p>
      </div>
    </div>
  )
}
