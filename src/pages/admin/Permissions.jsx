import { useState } from 'react'
import { Search, Info, Check, X, Loader } from 'lucide-react'
import Header from '../../components/Header'
import AppIcon from '../../components/AppIcon'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

function Avatar({ name }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'??'
  const colors = ['#e96363','#7c3aed','#059669','#d97706','#db2777']
  const color = colors[initials.charCodeAt(0)%colors.length]
  return <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{background:color}}>{initials}</div>
}

export default function AdminPermissions() {
  const { data: apps, loading: loadingApps } = useApi(() => api.getApps())
  const { data: users, loading: loadingUsers } = useApi(() => api.getUsers())
  const { data: permMap, loading: loadingPerms, reload: reloadPerms } = useApi(() => api.getPermissions())
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(null)

  const loading = loadingApps || loadingUsers || loadingPerms
  const activeApps = (apps||[]).filter(a=>a.active)
  const activeUsers = (users||[]).filter(u=>u.active).filter(u=>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  const hasAccess = (userId, appId) => (permMap?.[appId]||[]).includes(userId)

  const toggle = async (userId, appId) => {
    const key = `${userId}-${appId}`
    setToggling(key)
    try {
      if (hasAccess(userId, appId)) await api.revokeAccess(appId, userId)
      else await api.grantAccess(appId, userId)
      await reloadPerms()
    } finally { setToggling(null) }
  }

  const grantAll = async (userId) => {
    for (const app of activeApps) if (!hasAccess(userId, app.id)) await api.grantAccess(app.id, userId)
    reloadPerms()
  }

  const revokeAll = async (userId) => {
    for (const app of activeApps) if (hasAccess(userId, app.id)) await api.revokeAccess(app.id, userId)
    reloadPerms()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eyebrow="Admin" title="Controle de Permissões" subtitle="Configure quais usuários têm acesso a cada aplicação"/>

      <div className="px-10 py-6 space-y-5">
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-[12.5px]" style={{background:'rgba(233,99,99,0.06)',border:'1px solid rgba(233,99,99,0.20)',color:'#a83232'}}>
          <Info size={15} className="flex-shrink-0 mt-0.5"/>
          <p>Clique nas células para conceder ou revogar acesso. Dados salvos diretamente no banco de dados.</p>
        </div>

        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'#6b6b6b'}}/>
          <input className="input pl-9 text-[13px]" placeholder="Filtrar usuários..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        <div className="card overflow-x-auto">
          {loading ? <div className="flex justify-center py-12"><Loader size={20} className="animate-spin" style={{color:'#e96363'}}/></div> : (
          <table className="w-full text-sm">
            <thead><tr style={{borderBottom:'1px solid #e5dcd5',background:'#faf8f4'}}>
              <th className="text-left px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] min-w-[200px]" style={{color:'#6b6b6b'}}>Usuário</th>
              <th className="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-center" style={{color:'#6b6b6b'}}>Apps</th>
              {activeApps.map(app=>(
                <th key={app.id} className="px-3 py-3 min-w-[72px]">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${app.color}`}><AppIcon name={app.icon} size={13} className="text-white"/></div>
                    <span className="text-[10px] font-medium text-center max-w-[68px] leading-tight" style={{color:'#6b6b6b'}}>{app.name}</span>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-center min-w-[100px]" style={{color:'#6b6b6b'}}>Ações</th>
            </tr></thead>
            <tbody>
              {activeUsers.map(user=>{
                const count = activeApps.filter(a=>hasAccess(user.id,a.id)).length
                return (
                  <tr key={user.id} style={{borderBottom:'1px solid #efe7e0'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(233,99,99,0.015)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name}/>
                        <div><p className="font-semibold text-[13px]" style={{color:'#1c1c1c'}}>{user.name}</p><p className="text-[11px] font-mono" style={{color:'#6b6b6b'}}>{user.department}</p></div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:count>0?'rgba(233,99,99,0.10)':'#f0ebe7',color:count>0?'#a83232':'#6b6b6b'}}>{count}/{activeApps.length}</span>
                    </td>
                    {activeApps.map(app=>{
                      const has = hasAccess(user.id,app.id)
                      const key = `${user.id}-${app.id}`
                      const isToggling = toggling===key
                      return (
                        <td key={app.id} className="px-3 py-3 text-center">
                          <button onClick={()=>toggle(user.id,app.id)} disabled={!!isToggling} className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all" style={{background:has?'#229160':'#fff',border:`1px solid ${has?'#229160':'#e5dcd5'}`,color:has?'#fff':'#d8cdc4'}}>
                            {isToggling ? <Loader size={11} className="animate-spin"/> : has ? <Check size={12} strokeWidth={2.5}/> : <X size={12} strokeWidth={2}/>}
                          </button>
                        </td>
                      )
                    })}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={()=>grantAll(user.id)} className="text-[10px] px-2 py-1 rounded font-medium transition-colors" style={{background:'rgba(34,145,96,0.10)',color:'#1f8a59',border:'1px solid rgba(34,145,96,0.25)'}}>Todos</button>
                        <button onClick={()=>revokeAll(user.id)} className="text-[10px] px-2 py-1 rounded font-medium transition-colors" style={{background:'rgba(214,69,69,0.08)',color:'#b03333',border:'1px solid rgba(214,69,69,0.25)'}}>Nenhum</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  )
}
