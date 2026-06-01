import { useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ExternalLink, Search } from 'lucide-react'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import AppIcon from '../../components/AppIcon'
import { useAppStore } from '../../store/useAppStore'

const COLORS = [
  { label: 'Azul', value: 'from-blue-500 to-cyan-500' },
  { label: 'Violeta', value: 'from-violet-500 to-purple-600' },
  { label: 'Verde', value: 'from-emerald-500 to-teal-600' },
  { label: 'Laranja', value: 'from-orange-400 to-rose-500' },
  { label: 'Rosa', value: 'from-pink-500 to-rose-600' },
  { label: 'Âmbar', value: 'from-amber-500 to-orange-600' },
  { label: 'Ardósia', value: 'from-slate-600 to-slate-800' },
  { label: 'Índigo', value: 'from-indigo-500 to-blue-700' },
]

const ICONS = [
  'BarChart3', 'Users', 'DollarSign', 'UserCheck', 'Megaphone',
  'Package', 'Terminal', 'Scale', 'Globe', 'Database', 'Cloud', 'Zap', 'Mail', 'FileText',
]

const CATEGORIES = ['Analytics', 'CRM', 'ERP', 'RH', 'Marketing', 'Logística', 'TI', 'Jurídico', 'Outros']

const EMPTY_FORM = {
  name: '', description: '', url: '', icon: 'Globe', color: 'from-blue-500 to-cyan-500', category: 'Outros', active: true,
}

export default function AdminApps() {
  const { apps, addApp, updateApp, deleteApp, toggleAppActive } = useAppStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editApp, setEditApp] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditApp(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (app) => {
    setEditApp(app)
    setForm({ name: app.name, description: app.description, url: app.url, icon: app.icon, color: app.color, category: app.category, active: app.active })
    setModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editApp) {
      updateApp(editApp.id, form)
    } else {
      addApp({ ...form, id: `app-${Date.now()}` })
    }
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Gerenciar Aplicações" subtitle="Cadastre e configure os micro frontends da plataforma" />

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input pl-9 py-1.5 text-sm"
              placeholder="Buscar apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openCreate} className="btn-primary ml-auto">
            <Plus size={16} /> Nova Aplicação
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aplicação</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">URL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Categoria</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center flex-shrink-0`}>
                        <AppIcon name={app.icon} size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{app.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{app.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1 text-brand-600 hover:text-brand-800 text-xs truncate max-w-[180px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.url}
                      <ExternalLink size={11} className="flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="badge-blue">{app.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleAppActive(app.id)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        app.active
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {app.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {app.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(app)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                    Nenhuma aplicação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editApp ? 'Editar Aplicação' : 'Nova Aplicação'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input
                className="input"
                placeholder="Ex: BI Analytics"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">URL</label>
            <input
              className="input"
              placeholder="https://app.empresa.com"
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              className="input resize-none h-16"
              placeholder="Descreva brevemente o app..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                    form.icon === icon
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <AppIcon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Cor do Card</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.value} transition-all ${
                    form.color === c.value ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`h-14 rounded-xl bg-gradient-to-br ${form.color} flex items-center gap-3 px-4`}>
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <AppIcon name={form.icon} size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{form.name || 'Nome do App'}</p>
              <p className="text-white/70 text-xs">{form.category}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editApp ? 'Salvar Alterações' : 'Criar Aplicação'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Tem certeza que deseja excluir <strong>{deleteConfirm?.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button
              onClick={() => { deleteApp(deleteConfirm.id); setDeleteConfirm(null) }}
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
