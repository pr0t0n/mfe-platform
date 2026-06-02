import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, ShieldCheck, User, ToggleLeft, ToggleRight, Loader } from 'lucide-react'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/useAuthStore'

const DEPARTMENTS = ['TI','Comercial','Financeiro','RH','Marketing','Jurídico','Operações','Diretoria']
const EMPTY = { name:'', email:'', role:'user', department:'TI', company:'', password:'' }

function Avatar({ name }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'??'
  const colors = ['#e96363','#7c3aed','#059669','#d97706','#db2777']
  const color = colors[initials.charCodeAt(0)%colors.length]
  return <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{background:color}}>{initials}</div>
}

export default function AdminUsers() {
  const { data: users, loading, reload } = useApi(() => api.getUsers())
  const { data: companies } = useApi(() => api.getCompanies())
  const { currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filtered = (users||[]).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.department||'').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditUser(null); setForm(EMPTY); setError(''); setModalOpen(true) }
  const openEdit = u => { setEditUser(u); setForm({name:u.name,email:u.email,role:u.role,department:u.department||'TI',company:u.company||'',password:''}); setError(''); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editUser) await api.updateUser(editUser.id, { name:form.name, email:form.email, role:form.role, department:form.department })
      else await api.createUser(form)
      await reload(); setModalOpen(false)
    } catch(e){ setError(e.message) }
    finally { setSaving(false) }
  }

  const totalAdmins = (users||[]).filter(u=>u.role==='admin').length
  const totalActive = (users||[]).filter(u=>u.active).length

  return (
    <div className="flex flex-col min-h-screen">
      <Header eyebrow="Admin" title="Gerenciar Usuários" subtitle="Controle os usuários e seus perfis de acesso" actions={
        <button onClick={openCreate} className="btn-primary"><Plus size={15}/> Novo Usuário</button>
      }/>

      <div className="px-10 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[{label:'Total',value:(users||[]).length,color:'#e96363'},{label:'Ativos',value:totalActive,color:'#229160'},{label:'Admins',value:totalAdmins,color:'#7c3aed'}].map(s=>(
            <div key={s.label} className="card px-4 py-3 text-center">
              <p className="text-2xl font-bold" style={{color:s.color}}>{s.value}</p>
              <p className="text-[11.5px] mt-0.5" style={{color:'#6b6b6b'}}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'#6b6b6b'}}/>
          <input className="input pl-9 text-[13px]" placeholder="Buscar usuários..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        <div className="card overflow-hidden">
          {loading ? <div className="flex justify-center py-12"><Loader size={20} className="animate-spin" style={{color:'#e96363'}}/></div> : (
          <table className="w-full text-sm">
            <thead><tr style={{borderBottom:'1px solid #e5dcd5',background:'#faf8f4'}}>
              {['Usuário','Empresa','Departamento','Perfil','Status','Ações'].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{color:'#6b6b6b'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(user=>(
                <tr key={user.id} style={{borderBottom:'1px solid #efe7e0'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(233,99,99,0.025)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name}/>
                      <div>
                        <p className="font-semibold text-[13px] flex items-center gap-1.5" style={{color:'#1c1c1c'}}>
                          {user.name}
                          {user.id===currentUser?.id && <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{background:'rgba(233,99,99,0.10)',color:'#a83232'}}>Você</span>}
                        </p>
                        <p className="text-[11.5px] font-mono" style={{color:'#6b6b6b'}}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12.5px]" style={{color:'#6b6b6b'}}>{user.company||'—'}</td>
                  <td className="px-5 py-3 text-[12.5px]" style={{color:'#6b6b6b'}}>{user.department||'—'}</td>
                  <td className="px-5 py-3">
                    {user.role==='admin' ? <span className="flex items-center gap-1 text-[12px] font-medium" style={{color:'#7c3aed'}}><ShieldCheck size={13}/> Admin</span> : <span className="flex items-center gap-1 text-[12px] font-medium" style={{color:'#6b6b6b'}}><User size={13}/> Usuário</span>}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={()=>{api.toggleUser(user.id).then(reload)}} disabled={user.id===currentUser?.id} className="inline-flex items-center gap-1 text-[11.5px] font-medium px-2 py-1 rounded-full transition-colors disabled:opacity-50" style={{color:user.active?'#1f8a59':'#6b6b6b',background:user.active?'rgba(34,145,96,0.10)':'#f0ebe7'}}>
                      {user.active?<ToggleRight size={13}/>:<ToggleLeft size={13}/>}{user.active?'Ativo':'Inativo'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>openEdit(user)} className="w-7 h-7 flex items-center justify-center rounded" onMouseEnter={e=>{e.currentTarget.style.background='rgba(233,99,99,0.08)';e.currentTarget.style.color='#e96363'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b6b6b'}} style={{color:'#6b6b6b'}}><Pencil size={13}/></button>
                      <button onClick={()=>setDeleteConfirm(user)} disabled={user.id===currentUser?.id} className="w-7 h-7 flex items-center justify-center rounded disabled:opacity-40" onMouseEnter={e=>{e.currentTarget.style.background='rgba(214,69,69,0.08)';e.currentTarget.style.color='#b03333'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b6b6b'}} style={{color:'#6b6b6b'}}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={5} className="px-5 py-10 text-center text-[13px]" style={{color:'#6b6b6b'}}>Nenhum usuário encontrado</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editUser?'Editar Usuário':'Novo Usuário'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="label">Nome completo</label><input className="input" placeholder="João Silva" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div><label className="label">E-mail</label><input className="input" type="email" placeholder="joao@empresa.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
          <div>
            <label className="label">Empresa</label>
            <select className="input" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}>
              <option value="">— Selecionar empresa —</option>
              {(companies||[]).map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Departamento</label><select className="input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label className="label">Perfil</label><select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="user">Usuário</option><option value="admin">Administrador</option></select></div>
          </div>
          {!editUser && <div><label className="label">Senha inicial</label><input className="input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={6} required/></div>}
          {error && <p className="text-[13px] px-3 py-2 rounded" style={{color:'#b03333',background:'rgba(214,69,69,0.08)',border:'1px solid rgba(214,69,69,0.25)'}}>{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={()=>setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>{saving?<Loader size={14} className="animate-spin"/>:editUser?'Salvar':'Criar Usuário'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={()=>setDeleteConfirm(null)} title="Confirmar exclusão" size="sm">
        <p className="text-[13px] mb-4" style={{color:'#6b6b6b'}}>Excluir <strong>{deleteConfirm?.name}</strong>? Todas as permissões serão removidas.</p>
        <div className="flex gap-3">
          <button onClick={()=>setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={()=>{api.deleteUser(deleteConfirm.id).then(()=>{setDeleteConfirm(null);reload()})}} className="btn-danger flex-1 justify-center"><Trash2 size={14}/> Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
