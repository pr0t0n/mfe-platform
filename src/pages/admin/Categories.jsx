import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Building2, Loader, Check, X } from 'lucide-react'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

function ListSection({ title, icon: Icon, color, items, loading, onAdd, onEdit, onDelete }) {
  const [newName, setNewName] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true); setError('')
    try { await onAdd(newName.trim()); setNewName('') }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try { await onEdit(editItem.id, editName.trim()); setEditItem(null) }
    finally { setSaving(false) }
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #e5dcd5', background: '#faf8f4' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 className="text-[14px] font-semibold" style={{ color: '#1c1c1c' }}>{title}</h3>
        <span className="ml-auto font-mono text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#f0ebe7', color: '#6b6b6b' }}>
          {(items || []).length} registros
        </span>
      </div>

      {/* Add form */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #efe7e0' }}>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            className="input flex-1 text-[13px]"
            placeholder={`Nova ${title.toLowerCase().replace('lista de ', '')}...`}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary flex-shrink-0" disabled={saving}>
            {saving ? <Loader size={14} className="animate-spin" /> : <><Plus size={13} /> Adicionar</>}
          </button>
        </form>
        {error && (
          <p className="text-[12px] mt-2 px-3 py-1.5 rounded" style={{ color: '#b03333', background: 'rgba(214,69,69,0.08)', border: '1px solid rgba(214,69,69,0.25)' }}>
            {error}
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader size={18} className="animate-spin" style={{ color }} /></div>
      ) : (items || []).length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px]" style={{ color: '#6b6b6b' }}>Nenhum item cadastrado</p>
      ) : (
        <ul>
          {(items || []).map((item, idx) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors"
              style={{ borderTop: idx > 0 ? '1px solid #efe7e0' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,99,99,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon size={13} style={{ color, flexShrink: 0 }} />

              {editItem?.id === item.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    className="input flex-1 py-1.5 text-[13px]"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditItem(null) }}
                  />
                  <button onClick={handleEdit} className="w-7 h-7 flex items-center justify-center rounded" style={{ background: 'rgba(34,145,96,0.10)', color: '#1f8a59' }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditItem(null)} className="w-7 h-7 flex items-center justify-center rounded" style={{ background: '#f0ebe7', color: '#6b6b6b' }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-[13.5px] font-medium" style={{ color: '#1c1c1c' }}>{item.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditItem(item); setEditName(item.name) }}
                      className="w-7 h-7 flex items-center justify-center rounded transition-all"
                      style={{ color: '#6b6b6b' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,99,99,0.08)'; e.currentTarget.style.color = '#e96363' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="w-7 h-7 flex items-center justify-center rounded transition-all"
                      style={{ color: '#6b6b6b' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(214,69,69,0.08)'; e.currentTarget.style.color = '#b03333' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirm modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar exclusão" size="sm">
        <p className="text-[13px] mb-4" style={{ color: '#6b6b6b' }}>
          Excluir <strong>"{deleteConfirm?.name}"</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button
            onClick={async () => { await onDelete(deleteConfirm.id); setDeleteConfirm(null) }}
            className="btn-danger flex-1 justify-center"
          >
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default function AdminCategories() {
  const { data: categories, loading: loadingCat, reload: reloadCat } = useApi(() => api.getCategories())
  const { data: companies,  loading: loadingCo,  reload: reloadCo  } = useApi(() => api.getCompanies())

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        eyebrow="Admin"
        title="Categorias &amp; Empresas"
        subtitle="Gerencie as listas de categorias de apps e empresas dos usuários"
      />

      <div className="px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          <ListSection
            title="Categorias de Apps"
            icon={Tag}
            color="#e96363"
            items={categories}
            loading={loadingCat}
            onAdd={async (name) => { await api.createCategory(name); reloadCat() }}
            onEdit={async (id, name) => { await api.updateCategory(id, name); reloadCat() }}
            onDelete={async (id) => { await api.deleteCategory(id); reloadCat() }}
          />

          <ListSection
            title="Empresas"
            icon={Building2}
            color="#4b73ff"
            items={companies}
            loading={loadingCo}
            onAdd={async (name) => { await api.createCompany(name); reloadCo() }}
            onEdit={async (id, name) => { await api.updateCompany(id, name); reloadCo() }}
            onDelete={async (id) => { await api.deleteCompany(id); reloadCo() }}
          />
        </div>
      </div>
    </div>
  )
}
