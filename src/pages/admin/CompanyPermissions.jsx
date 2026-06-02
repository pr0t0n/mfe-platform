import { useState } from 'react'
import { Check, X, Loader, Info, Building2 } from 'lucide-react'
import Header from '../../components/Header'
import AppIcon from '../../components/AppIcon'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

export default function AdminCompanyPermissions() {
  const { data: apps, loading: loadingApps } = useApi(() => api.getApps())
  const { data: companies, loading: loadingCompanies } = useApi(() => api.getCompanies())
  const { data: companyPerms, loading: loadingPerms, reload } = useApi(() => api.getCompanyPermissions())
  const [toggling, setToggling] = useState(null)

  const loading = loadingApps || loadingCompanies || loadingPerms
  const activeApps = (apps || []).filter(a => a.active)

  const hasAccess = (company, appId) => (companyPerms?.[company] || []).includes(appId)

  const toggle = async (company, appId) => {
    const key = `${company}-${appId}`
    setToggling(key)
    try {
      if (hasAccess(company, appId)) {
        await api.revokeCompanyAccess(company, appId)
      } else {
        await api.grantCompanyAccess(company, appId)
      }
      await reload()
    } finally { setToggling(null) }
  }

  const grantAll = async (company) => {
    for (const app of activeApps) if (!hasAccess(company, app.id)) await api.grantCompanyAccess(company, app.id)
    reload()
  }

  const revokeAll = async (company) => {
    for (const app of activeApps) if (hasAccess(company, app.id)) await api.revokeCompanyAccess(company, app.id)
    reload()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        eyebrow="Admin"
        title="Acesso por Empresa"
        subtitle="Configure quais apps cada empresa pode acessar — usuários herdam automaticamente"
      />

      <div className="px-10 py-6 space-y-5">
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-[12.5px]" style={{ background: 'rgba(233,99,99,0.06)', border: '1px solid rgba(233,99,99,0.20)', color: '#a83232' }}>
          <Info size={15} className="flex-shrink-0 mt-0.5" />
          <p>
            Permissões definidas aqui são aplicadas a <strong>todos os usuários ativos da empresa</strong>,
            inclusive novos cadastros. Permissões individuais (em Permissões) continuam válidas independentemente.
          </p>
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader size={20} className="animate-spin" style={{ color: '#e96363' }} /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e5dcd5', background: '#faf8f4' }}>
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] min-w-[180px]" style={{ color: '#6b6b6b' }}>
                    Empresa
                  </th>
                  <th className="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-center" style={{ color: '#6b6b6b' }}>
                    Apps
                  </th>
                  {activeApps.map(app => (
                    <th key={app.id} className="px-3 py-3 min-w-[72px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${app.color}`}>
                          <AppIcon name={app.icon} size={13} className="text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-center max-w-[68px] leading-tight" style={{ color: '#6b6b6b' }}>
                          {app.name}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-center min-w-[100px]" style={{ color: '#6b6b6b' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {(companies || []).map(co => {
                  const count = activeApps.filter(a => hasAccess(co.name, a.id)).length
                  return (
                    <tr
                      key={co.id}
                      style={{ borderBottom: '1px solid #efe7e0' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,99,99,0.015)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(233,99,99,0.10)' }}>
                            <Building2 size={14} style={{ color: '#e96363' }} />
                          </div>
                          <p className="font-semibold text-[13px]" style={{ color: '#1c1c1c' }}>{co.name}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: count > 0 ? 'rgba(233,99,99,0.10)' : '#f0ebe7', color: count > 0 ? '#a83232' : '#6b6b6b' }}
                        >
                          {count}/{activeApps.length}
                        </span>
                      </td>
                      {activeApps.map(app => {
                        const has = hasAccess(co.name, app.id)
                        const key = `${co.name}-${app.id}`
                        const isToggling = toggling === key
                        return (
                          <td key={app.id} className="px-3 py-3 text-center">
                            <button
                              onClick={() => toggle(co.name, app.id)}
                              disabled={!!isToggling}
                              className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all"
                              style={{
                                background: has ? '#229160' : '#fff',
                                border: `1px solid ${has ? '#229160' : '#e5dcd5'}`,
                                color: has ? '#fff' : '#d8cdc4',
                              }}
                            >
                              {isToggling ? (
                                <Loader size={11} className="animate-spin" />
                              ) : has ? (
                                <Check size={12} strokeWidth={2.5} />
                              ) : (
                                <X size={12} strokeWidth={2} />
                              )}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => grantAll(co.name)}
                            className="text-[10px] px-2 py-1 rounded font-medium"
                            style={{ background: 'rgba(34,145,96,0.10)', color: '#1f8a59', border: '1px solid rgba(34,145,96,0.25)' }}
                          >
                            Todos
                          </button>
                          <button
                            onClick={() => revokeAll(co.name)}
                            className="text-[10px] px-2 py-1 rounded font-medium"
                            style={{ background: 'rgba(214,69,69,0.08)', color: '#b03333', border: '1px solid rgba(214,69,69,0.25)' }}
                          >
                            Nenhum
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11.5px]" style={{ color: '#6b6b6b' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-[#229160] flex items-center justify-center">
              <Check size={11} className="text-white" strokeWidth={3} />
            </div>
            Empresa tem acesso — todos os usuários herdaram
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded border border-[#e5dcd5] bg-white flex items-center justify-center">
              <X size={11} style={{ color: '#d8cdc4' }} />
            </div>
            Sem acesso por empresa
          </div>
        </div>
      </div>
    </div>
  )
}
