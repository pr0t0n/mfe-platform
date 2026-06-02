import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ExternalLink, Search, Loader, KeyRound } from 'lucide-react'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import AppIcon from '../../components/AppIcon'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

const COLORS = [
  { label: 'Azul',    value: 'from-blue-500 to-cyan-500' },
  { label: 'Violeta', value: 'from-violet-500 to-purple-600' },
  { label: 'Verde',   value: 'from-emerald-500 to-teal-600' },
  { label: 'Laranja', value: 'from-orange-400 to-rose-500' },
  { label: 'Rosa',    value: 'from-pink-500 to-rose-600' },
  { label: 'Âmbar',  value: 'from-amber-500 to-orange-600' },
  { label: 'Ardósia', value: 'from-slate-600 to-slate-800' },
  { label: 'Índigo',  value: 'from-indigo-500 to-blue-700' },
  { label: 'Vermelho',value: 'from-red-500 to-rose-700' },
  { label: 'Lima',    value: 'from-lime-500 to-green-600' },
]
const ICONS = ['BarChart3','Users','DollarSign','UserCheck','Megaphone','Package','Terminal','Scale','Globe','Database','Cloud','Zap','Mail','FileText','ShieldCheck','Layers']
// Categories loaded from API (see form below)
const EMPTY = { name:'', description:'', url:'', icon:'Globe', color:'from-blue-500 to-cyan-500', category:'Outros', active:true, trial_days:30 }

export default function AdminApps() {
  const { data: apps, loading, reload } = useApi(() => api.getApps())
  const { data: categoryData } = useApi(() => api.getCategories())
  const CATEGORIES = (categoryData || []).map(c => c.name)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editApp, setEditApp] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filtered = (apps || []).filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditApp(null); setForm(EMPTY); setError(''); setModalOpen(true) }
  const openEdit = (app) => { setEditApp(app); setForm({ name:app.name, description:app.description||'', url:app.url, icon:app.icon, color:app.color, category:app.category, active:!!app.active, trial_days:app.trial_days??30 }); setError(''); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editApp) await api.updateApp(editApp.id, form)
      else await api.createApp(form)
      await reload(); setModalOpen(false)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (id) => { await api.toggleApp(id); reload() }
  const handleDelete = async () => { await api.deleteApp(deleteConfirm.id); setDeleteConfirm(null); reload() }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eyebrow="Admin" title="Gerenciar Aplicações" subtitle="Cadastre e configure os micro-frontends da plataforma" actions={
        <button onClick={openCreate} className="btn-primary"><Plus size={15}/> Nova Aplicação</button>
      }/>

      <div className="px-10 py-6 space-y-5">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6b6b6b' }} />
          <input className="input pl-9 text-[13px]" placeholder="Buscar apps..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader size={20} className="animate-spin" style={{ color: '#e96363' }}/></div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #e5dcd5', background: '#faf8f4' }}>
                {['Aplicação','URL','Categoria','Status','SSO','Ações'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#6b6b6b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #efe7e0' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(233,99,99,0.025)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${app.color}`}>
                        <AppIcon name={app.icon} size={16} className="text-white"/>
                      </div>
                      <div>
                        <p className="font-semibold text-[13px]" style={{ color: '#1c1c1c' }}>{app.name}</p>
                        <p className="text-[11.5px] truncate max-w-[180px]" style={{ color: '#6b6b6b' }}>{app.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <a href={app.url} target="_blank" rel="noopener" className="flex items-center gap-1 text-[12px] truncate max-w-[180px]" style={{ color: '#e96363' }} onClick={e=>e.stopPropagation()}>
                      {app.url}<ExternalLink size={10}/>
                    </a>
                  </td>
                  <td className="px-5 py-3"><span className="badge-blue">{app.category}</span></td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleToggle(app.id)} className="inline-flex items-center gap-1 text-[11.5px] font-medium px-2 py-1 rounded-full transition-colors" style={{ color: app.active ? '#1f8a59' : '#6b6b6b', background: app.active ? 'rgba(34,145,96,0.10)' : '#f0ebe7' }}>
                      {app.active ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
                      {app.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => api.toggleAppSso(app.id).then(reload)}
                      title={app.sso_enabled ? 'SSO ativo — clique para desativar' : 'SSO inativo — clique para ativar'}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors font-mono"
                      style={{
                        color: app.sso_enabled ? '#a83232' : '#6b6b6b',
                        background: app.sso_enabled ? 'rgba(233,99,99,0.10)' : '#f0ebe7',
                        border: `1px solid ${app.sso_enabled ? 'rgba(233,99,99,0.30)' : '#e5dcd5'}`,
                      }}
                    >
                      <KeyRound size={11} />
                      {app.sso_enabled ? 'Ativo' : 'Off'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(app)} className="w-7 h-7 flex items-center justify-center rounded transition-all" style={{ color: '#6b6b6b', border: '1px solid transparent' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(233,99,99,0.08)';e.currentTarget.style.color='#e96363'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b6b6b'}}><Pencil size={13}/></button>
                      <button onClick={() => setDeleteConfirm(app)} className="w-7 h-7 flex items-center justify-center rounded transition-all" style={{ color: '#6b6b6b', border: '1px solid transparent' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(214,69,69,0.08)';e.currentTarget.style.color='#b03333'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b6b6b'}}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px]" style={{ color: '#6b6b6b' }}>Nenhuma aplicação encontrada</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editApp ? 'Editar Aplicação' : 'Nova Aplicação'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Nome</label><input className="input" placeholder="Ex: BI Analytics" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
            <div><label className="label">Categoria</label><select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="label">URL</label><input className="input" type="url" placeholder="https://app.empresa.com" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} required/></div>
          <div><label className="label">Descrição</label><textarea className="input resize-none h-16" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div>
            <label className="label">Ícone</label>
            <div className="flex flex-wrap gap-2">{ICONS.map(icon=>(
              <button key={icon} type="button" onClick={()=>setForm({...form,icon})} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all" style={{ border: form.icon===icon ? '2px solid #e96363' : '1px solid #e5dcd5', background: form.icon===icon ? 'rgba(233,99,99,0.08)' : '#fff', color: form.icon===icon ? '#e96363' : '#6b6b6b' }}><AppIcon name={icon} size={15}/></button>
            ))}</div>
          </div>
          <div>
            <label className="label">Cor</label>
            <div className="flex flex-wrap gap-2">{COLORS.map(c=>(
              <button key={c.value} type="button" onClick={()=>setForm({...form,color:c.value})} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.value} transition-all`} style={{ outline: form.color===c.value ? '2px solid #e96363' : 'none', outlineOffset: '2px', transform: form.color===c.value ? 'scale(1.1)' : 'scale(1)' }} title={c.label}/>
            ))}</div>
          </div>
          <div className={`h-12 rounded-xl flex items-center gap-3 px-4 bg-gradient-to-br ${form.color}`}>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><AppIcon name={form.icon} size={16} className="text-white"/></div>
            <div><p className="text-white text-[13px] font-semibold">{form.name || 'Nome do App'}</p><p className="text-white/70 text-[10.5px] font-mono">{form.category}</p></div>
          </div>
          {error && <p className="text-[13px] px-3 py-2 rounded" style={{ color: '#b03333', background: 'rgba(214,69,69,0.08)', border: '1px solid rgba(214,69,69,0.25)' }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={()=>setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>{saving ? <Loader size={14} className="animate-spin"/> : editApp ? 'Salvar' : 'Criar Aplicação'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={()=>setDeleteConfirm(null)} title="Confirmar exclusão" size="sm">
        <p className="text-[13px] mb-4" style={{ color: '#6b6b6b' }}>Excluir <strong>{deleteConfirm?.name}</strong>? Esta ação não pode ser desfeita e removerá todas as permissões associadas.</p>
        <div className="flex gap-3">
          <button onClick={()=>setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center"><Trash2 size={14}/> Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
