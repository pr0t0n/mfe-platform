import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, ShieldCheck, User, ToggleLeft, ToggleRight } from 'lucide-react'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import { useUserStore } from '../../store/useUserStore'
import { useAuthStore } from '../../store/useAuthStore'

const DEPARTMENTS = ['TI', 'Comercial', 'Financeiro', 'RH', 'Marketing', 'Jurídico', 'Operações', 'Diretoria']
const EMPTY_FORM = { name: '', email: '', role: 'user', department: 'TI', password: '' }

function AvatarBubble({ name, size = 'md' }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  const colors = ['bg-brand-600', 'bg-violet-600', 'bg-emerald-600', 'bg-orange-500', 'bg-rose-500', 'bg-teal-600']
  const color = colors[initials.charCodeAt(0) % colors.length]
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function AdminUsers() {
  const { users, addUser, updateUser, deleteUser, toggleUserActive } = useUserStore()
  const { currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, role: user.role, department: user.department || 'TI', password: '' })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editUser) {
      updateUser(editUser.id, { name: form.name, email: form.email, role: form.role, department: form.department })
    } else {
      addUser(form)
    }
    setModalOpen(false)
  }

  const totalAdmins = users.filter((u) => u.role === 'admin').length
  const totalActive = users.filter((u) => u.active).length

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Gerenciar Usuários" subtitle="Controle os usuários e seus perfis de acesso" />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total de usuários', value: users.length, color: 'text-brand-600' },
            { label: 'Usuários ativos', value: totalActive, color: 'text-emerald-600' },
            { label: 'Administradores', value: totalAdmins, color: 'text-violet-600' },
          ].map((stat) => (
            <div key={stat.label} className="card px-4 py-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 py-1.5 text-sm"
              placeholder="Buscar usuários..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-primary ml-auto">
            <Plus size={16} /> Novo Usuário
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Departamento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Perfil</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarBubble name={user.name} />
                      <div>
                        <p className="font-medium text-slate-800 flex items-center gap-1">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-brand-100 text-brand-600 font-semibold">Você</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-600 text-xs">{user.department || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-violet-700">
                        <ShieldCheck size={13} /> Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <User size={13} /> Usuário
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleUserActive(user.id)}
                      disabled={user.id === currentUser?.id}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.active
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {user.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {user.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        disabled={user.id === currentUser?.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Editar Usuário' : 'Novo Usuário'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input
              className="input"
              placeholder="João Silva"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              placeholder="joao@empresa.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="label">Perfil</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {!editUser && (
            <div>
              <label className="label">Senha inicial</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editUser ? 'Salvar' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar exclusão" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Excluir o usuário <strong>{deleteConfirm?.name}</strong>? Todas as permissões serão removidas.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button
              onClick={() => { deleteUser(deleteConfirm.id); setDeleteConfirm(null) }}
              className="btn-danger flex-1 justify-center"
            >
              <Trash2 size={15} /> Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
