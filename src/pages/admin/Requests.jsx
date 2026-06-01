import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Search, Inbox, Loader } from 'lucide-react'
import Header from '../../components/Header'
import AppIcon from '../../components/AppIcon'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

const STATUS = { pending:{label:'Pendente',color:'#a47700',bg:'rgba(254,200,0,0.12)',border:'rgba(254,200,0,0.40)',Icon:Clock}, approved:{label:'Aprovado',color:'#1f8a59',bg:'rgba(34,145,96,0.10)',border:'rgba(34,145,96,0.25)',Icon:CheckCircle}, rejected:{label:'Rejeitado',color:'#b03333',bg:'rgba(214,69,69,0.10)',border:'rgba(214,69,69,0.30)',Icon:XCircle} }

export default function AdminRequests() {
  const { data: requests, loading, reload } = useApi(() => api.getRequests())
  const { data: apps } = useApi(() => api.getApps())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [working, setWorking] = useState(null)

  const filtered = (requests||[]).filter(r => {
    const matchSearch = r.user_name.toLowerCase().includes(search.toLowerCase()) || r.app_name.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (filter==='all' || r.status===filter)
  }).sort((a,b) => new Date(b.created_at)-new Date(a.created_at))

  const pending = (requests||[]).filter(r=>r.status==='pending').length
  const getApp = id => (apps||[]).find(a=>a.id===id)

  const handleApprove = async (r) => { setWorking(r.id); try { await api.approveRequest(r.id); reload() } finally { setWorking(null) } }
  const handleReject  = async (r) => { setWorking(r.id); try { await api.rejectRequest(r.id);  reload() } finally { setWorking(null) } }

  const fmt = iso => new Date(iso).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})

  return (
    <div className="flex flex-col min-h-screen">
      <Header eyebrow="Admin" title="Solicitações de Acesso" subtitle="Gerencie pedidos de degustação dos usuários"/>

      <div className="px-10 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[{label:'Pendentes',value:(requests||[]).filter(r=>r.status==='pending').length,color:'#a47700'},{label:'Aprovadas',value:(requests||[]).filter(r=>r.status==='approved').length,color:'#1f8a59'},{label:'Rejeitadas',value:(requests||[]).filter(r=>r.status==='rejected').length,color:'#b03333'}].map(s=>(
            <div key={s.label} className="card px-4 py-3 text-center"><p className="text-2xl font-bold" style={{color:s.color}}>{s.value}</p><p className="text-[11.5px] mt-0.5" style={{color:'#6b6b6b'}}>{s.label}</p></div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'#6b6b6b'}}/>
            <input className="input pl-9 text-[13px]" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="flex gap-1.5">
            {['all','pending','approved','rejected'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-all" style={{background:filter===f?'#e96363':'#fff',color:filter===f?'#fff':'#3d3d3d',border:`1px solid ${filter===f?'#e96363':'#e5dcd5'}`}}>
                {f==='all'?'Todas':STATUS[f]?.label}
                {f==='pending'&&pending>0&&<span className="px-1 py-0.5 text-[10px] font-bold rounded-full" style={{background:filter==='pending'?'#fff':'#e96363',color:filter==='pending'?'#e96363':'#fff'}}>{pending}</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader size={20} className="animate-spin" style={{color:'#e96363'}}/></div>
        ) : filtered.length===0 ? (
          <div className="card py-16 text-center"><Inbox size={28} className="mx-auto mb-3" style={{color:'#d8cdc4'}}/><p className="font-semibold" style={{color:'#3d3d3d'}}>Nenhuma solicitação</p><p className="text-[13px] mt-1" style={{color:'#6b6b6b'}}>Quando usuários solicitarem acesso aparecerá aqui</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req=>{
              const app = getApp(req.app_id)
              const s = STATUS[req.status]||STATUS.pending
              return (
                <div key={req.id} className="card p-4 animate-fadeIn" style={{borderColor:req.status==='pending'?'rgba(254,200,0,0.40)':'#e5dcd5',background:req.status==='pending'?'rgba(254,200,0,0.03)':'#fff'}}>
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${app?.color||'from-slate-400 to-slate-500'}`}>
                      <AppIcon name={app?.icon||'Globe'} size={19} className="text-white"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[13px]" style={{color:'#1c1c1c'}}>{req.user_name}</p>
                            <span className="text-[12.5px]" style={{color:'#6b6b6b'}}>→</span>
                            <p className="font-semibold text-[13px]" style={{color:'#1c1c1c'}}>{req.app_name}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium" style={{color:s.color,background:s.bg,border:`1px solid ${s.border}`}}>
                              <s.Icon size={10}/>{s.label}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] mt-1" style={{color:'#6b6b6b'}}>{fmt(req.created_at)}</p>
                        </div>
                        {req.status==='pending' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={()=>handleApprove(req)} disabled={working===req.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold text-white transition-all" style={{background:'#229160'}} onMouseEnter={e=>e.currentTarget.style.background='#1f7a54'} onMouseLeave={e=>e.currentTarget.style.background='#229160'}>
                              {working===req.id?<Loader size={12} className="animate-spin"/>:<><CheckCircle size={13}/> Aprovar</>}
                            </button>
                            <button onClick={()=>handleReject(req)} disabled={working===req.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-all" style={{background:'#fff',color:'#b03333',border:'1px solid rgba(214,69,69,0.30)'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(214,69,69,0.06)'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                              <XCircle size={13}/> Rejeitar
                            </button>
                          </div>
                        )}
                      </div>
                      {req.message && <div className="mt-2 px-3 py-2 rounded text-[12.5px] leading-relaxed" style={{background:'#faf8f4',border:'1px solid #efe7e0',color:'#6b6b6b'}}><span style={{color:'#3d3d3d',fontWeight:500}}>Justificativa: </span>{req.message}</div>}
                      {req.resolved_at && <p className="font-mono text-[11px] mt-1.5" style={{color:'#6b6b6b'}}>{req.status==='approved'?'Aprovado':'Rejeitado'} em {fmt(req.resolved_at)}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
