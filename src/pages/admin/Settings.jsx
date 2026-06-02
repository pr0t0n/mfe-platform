import { useState, useEffect } from 'react'
import { KeyRound, Clock, Building2, Save, Loader, CheckCircle, ShieldCheck, ToggleLeft, ToggleRight, Info } from 'lucide-react'
import Header from '../../components/Header'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

function Toggle({ enabled, onToggle, loading }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
      style={{
        background: enabled ? 'rgba(233,99,99,0.10)' : '#f0ebe7',
        color: enabled ? '#a83232' : '#6b6b6b',
        border: `1px solid ${enabled ? 'rgba(233,99,99,0.30)' : '#e5dcd5'}`,
      }}
    >
      {loading ? (
        <Loader size={14} className="animate-spin" />
      ) : enabled ? (
        <ToggleRight size={16} />
      ) : (
        <ToggleLeft size={16} />
      )}
      {enabled ? 'Ativado' : 'Desativado'}
    </button>
  )
}

export default function AdminSettings() {
  const { data: settings, loading, reload } = useApi(() => api.getSettings())
  const [form, setForm] = useState({ platform_name: '', platform_subtitle: '', trial_default_days: '30' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    if (settings) {
      setForm({
        platform_name: settings.platform_name || 'CyberOps HUB',
        platform_subtitle: settings.platform_subtitle || 'Plataforma de Cyber Security VALID',
        trial_default_days: settings.trial_default_days || '30',
      })
    }
  }, [settings])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.saveSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      reload()
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (key) => {
    setToggling(key)
    try {
      await api.toggleSetting(key)
      reload()
    } finally {
      setToggling(null)
    }
  }

  const ssoEnabled = settings?.sso_global_enabled === '1'

  return (
    <div className="flex flex-col min-h-screen">
      <Header eyebrow="Admin" title="Configurações da Plataforma" subtitle="Parâmetros globais do CyberOps HUB" />

      <div className="px-10 py-6 max-w-2xl space-y-6">

        {/* SSO / JWT Global */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ssoEnabled ? 'rgba(233,99,99,0.10)' : '#f0ebe7' }}>
                <KeyRound size={18} style={{ color: ssoEnabled ? '#e96363' : '#6b6b6b' }} />
              </div>
              <div>
                <h3 className="text-[14.5px] font-semibold" style={{ color: '#1c1c1c' }}>SSO via JWT</h3>
                <p className="text-[12.5px] mt-0.5" style={{ color: '#6b6b6b' }}>
                  Quando ativado, o HUB gera um token JWT ao abrir um app com SSO habilitado
                  e o passa como <code className="font-mono text-[11px] px-1 py-0.5 rounded" style={{ background: '#f0ebe7', color: '#a83232' }}>?sso_token=xxx</code> na URL do iframe.
                </p>
              </div>
            </div>
            <Toggle
              enabled={ssoEnabled}
              onToggle={() => handleToggle('sso_global_enabled')}
              loading={toggling === 'sso_global_enabled'}
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg text-[12px]" style={{ background: '#faf8f4', border: '1px solid #efe7e0' }}>
            <Info size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#6b6b6b' }} />
            <p style={{ color: '#6b6b6b' }}>
              O toggle por app (Admin → Aplicações → coluna SSO) controla individualmente cada app.
              Este toggle global desativa o SSO para toda a plataforma, mesmo que os apps individuais estejam ativos.
              O endpoint <code className="font-mono" style={{ color: '#a83232' }}>GET /api/sso/verify?token=xxx</code> fica disponível para os apps validarem o token.
            </p>
          </div>
        </div>

        {/* Degustação */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(75,115,255,0.10)' }}>
              <Clock size={18} style={{ color: '#4b73ff' }} />
            </div>
            <div>
              <h3 className="text-[14.5px] font-semibold" style={{ color: '#1c1c1c' }}>Degustação padrão</h3>
              <p className="text-[12.5px] mt-0.5" style={{ color: '#6b6b6b' }}>
                Prazo padrão para novas solicitações aprovadas. Cada app pode ter seu próprio prazo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={365}
              className="input w-28 text-center text-[15px] font-bold"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              value={form.trial_default_days}
              onChange={e => setForm({ ...form, trial_default_days: e.target.value })}
            />
            <span className="text-[13px]" style={{ color: '#6b6b6b' }}>dias de degustação para novos acessos aprovados</span>
          </div>
        </div>

        {/* Identidade da plataforma */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,145,96,0.10)' }}>
              <Building2 size={18} style={{ color: '#229160' }} />
            </div>
            <div>
              <h3 className="text-[14.5px] font-semibold" style={{ color: '#1c1c1c' }}>Identidade da Plataforma</h3>
              <p className="text-[12.5px] mt-0.5" style={{ color: '#6b6b6b' }}>Nome e subtítulo exibidos na tela de login e sidebar.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Nome da plataforma</label>
              <input className="input" value={form.platform_name} onChange={e => setForm({ ...form, platform_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Subtítulo</label>
              <input className="input" value={form.platform_subtitle} onChange={e => setForm({ ...form, platform_subtitle: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Save */}
        <form onSubmit={handleSave}>
          <button type="submit" className="btn-primary" disabled={saving || loading}>
            {saving ? (
              <><Loader size={15} className="animate-spin" /> Salvando...</>
            ) : saved ? (
              <><CheckCircle size={15} /> Salvo com sucesso!</>
            ) : (
              <><Save size={15} /> Salvar Configurações</>
            )}
          </button>
        </form>

        {/* Persistência */}
        <div className="card p-5" style={{ borderColor: 'rgba(34,145,96,0.25)', background: 'rgba(34,145,96,0.03)' }}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={15} style={{ color: '#229160' }} />
            <p className="text-[12.5px] font-semibold" style={{ color: '#229160' }}>Banco de dados persistente</p>
          </div>
          <p className="text-[12px]" style={{ color: '#6b6b6b' }}>
            Todos os dados (apps, usuários, permissões, solicitações, configurações) são salvos no SQLite
            em um volume Docker (<code className="font-mono" style={{ color: '#a83232' }}>cyberops-db</code>).
            Reinicializações do container não afetam os dados.
          </p>
        </div>
      </div>
    </div>
  )
}
