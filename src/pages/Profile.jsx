import { useState } from 'react'
import { User, Mail, Building2, Shield, Save, CheckCircle } from 'lucide-react'
import Header from '../components/Header'
import { useAuthStore } from '../store/useAuthStore'
import { useRequestStore } from '../store/useRequestStore'
import { useAppStore } from '../store/useAppStore'

const DEPARTMENTS = ['TI', 'Comercial', 'Financeiro', 'RH', 'Marketing', 'Jurídico', 'Operações', 'Diretoria']

export default function Profile() {
  const { currentUser, updateProfile } = useAuthStore()
  const { getUserRequests } = useRequestStore()
  const { getUserApps } = useAppStore()

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    department: currentUser?.department || 'TI',
  })
  const [saved, setSaved] = useState(false)

  const myRequests = getUserRequests(currentUser?.id || '')
  const myApps = getUserApps(currentUser?.id || '').filter((a) => a.hasAccess && a.active)

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile({
      name: form.name,
      department: form.department,
      avatar: form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const roleLabel = currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'
  const roleColor = currentUser?.role === 'admin' ? 'from-violet-500 to-purple-700' : 'from-brand-500 to-brand-700'

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Meu Perfil" subtitle="Gerencie suas informações e veja seus acessos" />

      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Profile card */}
          <div className="card overflow-hidden">
            <div className={`h-24 bg-gradient-to-br ${roleColor} relative`}>
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }} />
            </div>
            <div className="px-6 pb-5">
              <div className="-mt-10 mb-4 flex items-end gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white`}>
                  {currentUser?.avatar}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-800">{currentUser?.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${roleColor}`}>
                      <Shield size={10} />
                      {roleLabel}
                    </span>
                    <span className="text-slate-400 text-xs">{currentUser?.department}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <Mail size={14} className="text-slate-400" />
                {currentUser?.email}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Apps com acesso', value: myApps.length },
                  { label: 'Solicitações', value: myRequests.length },
                  { label: 'Membro desde', value: currentUser?.createdAt || '—' },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-700">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card px-6 py-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={16} className="text-brand-500" />
              Editar Informações
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Nome completo</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">E-mail (não editável)</label>
                <input className="input bg-slate-50 text-slate-400 cursor-not-allowed" value={currentUser?.email} disabled />
              </div>
              <div>
                <label className="label">Departamento</label>
                <select
                  className="input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-primary">
                {saved ? (
                  <>
                    <CheckCircle size={16} className="text-emerald-300" />
                    Salvo com sucesso!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </form>
          </div>

          {/* My apps */}
          {myApps.length > 0 && (
            <div className="card px-6 py-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-brand-500" />
                Meus Aplicativos ({myApps.length})
              </h3>
              <div className="space-y-2">
                {myApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => window.open(app.url, '_blank', 'noopener')}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{app.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">{app.name}</p>
                      <p className="text-xs text-slate-400 truncate">{app.url}</p>
                    </div>
                    <span className="badge-green">Ativo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My requests */}
          {myRequests.length > 0 && (
            <div className="card px-6 py-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-brand-500" />
                Minhas Solicitações ({myRequests.length})
              </h3>
              <div className="space-y-2">
                {myRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{req.appName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={
                      req.status === 'approved' ? 'badge-green' :
                      req.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                    }>
                      {req.status === 'approved' ? 'Aprovado' : req.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
