import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, Loader, Check, X } from 'lucide-react'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import { useApi } from '../../hooks/useApi'
import { api } from '../../lib/api'

export default function AdminCategories() {
  const { data: categories, loading, reload } = useApi(() => api.getCategories())
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
    try { await api.createCategory(newName.trim()); setNewName(''); reload() }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try { await api.updateCategory(editItem.id, editName.trim()); setEditItem(null); reload() }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    await api.deleteCategory(deleteConfirm.id)
    setDeleteConfirm(null); reload()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eyebrow="Admin" title="Categorias" subtitle="Gerencie as categorias de aplicativos disponíveis no portal" />

      <div className="px-10 py-6 max-w-xl space-y-6">
        {/* Add new */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2" style={{ color: '#1c1c1c' }}>
            <Tag size={15} style={{ color: '#e96363' }} /> Nova Categoria
          </h3>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Ex: Segurança, DevOps, Compliance..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary flex-shrink-0" disabled={saving}>
              {saving ? <Loader size={14} className="animate-spin" /> : <><Plus size={14} /> Adicionar</>}
            </button>
          </form>
          {error && <p className="text-[12.5px] mt-2 px-3 py-2 rounded" style={{ color: '#b03333', background: 'rgba(214,69,69,0.08)', border: '1px solid rgba(214,69,69,0.25)' }}>{error}</p>}
        </div>

        {/* List */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid #e5dcd5', background: '#faf8f4' }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#6b6b6b' }}>
              Categorias cadastradas — {(categories || []).length}
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><Loader size={20} className="animate-spin" style={{ color: '#e96363' }} /></div>
          ) : (
            <ul className="divide-y" style={{ borderColor: '#efe7e0' }}>
              {(categories || []).map(cat => (
                <li key={cat.id} className="flex items-center gap-3 px-5 py-3 transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,99,99,0.025)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Tag size={14} style={{ color: '#e96363', flexShrink: 0 }} />

                  {editItem?.id === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        className="input flex-1 py-1.5 text-[13px]"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditItem(null) }}
                      />
                      <button onClick={handleEdit} className="w-7 h-7 flex items-center justify-center rounded" style={{ background: 'rgba(34,145,96,0.10)', color: '#1f8a59' }}><Check size={13} /></button>
                      <button onClick={() => setEditItem(null)} className="w-7 h-7 flex items-center justify-center rounded" style={{ background: '#f0ebe7', color: '#6b6b6b' }}><X size={13} /></button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-[13.5px] font-medium" style={{ color: '#1c1c1c' }}>{cat.name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditItem(cat); setEditName(cat.name) }} className="w-7 h-7 flex items-center justify-center rounded transition-all" style={{ color: '#6b6b6b' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,99,99,0.08)'; e.currentTarget.style.color = '#e96363' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}><Pencil size={13} /></button>
                        <button onClick={() => setDeleteConfirm(cat)} className="w-7 h-7 flex items-center justify-center rounded transition-all" style={{ color: '#6b6b6b' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(214,69,69,0.08)'; e.currentTarget.style.color = '#b03333' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b6b' }}><Trash2 size={13} /></button>
                      </div>
                    </>
                  )}
                </li>
              ))}
              {(categories || []).length === 0 && (
                <li className="px-5 py-8 text-center text-[13px]" style={{ color: '#6b6b6b' }}>Nenhuma categoria cadastrada</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar exclusão" size="sm">
        <p className="text-[13px] mb-4" style={{ color: '#6b6b6b' }}>Excluir a categoria <strong>"{deleteConfirm?.name}"</strong>? Apps com essa categoria ficam com a categoria anterior.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center"><Trash2 size={14} /> Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
