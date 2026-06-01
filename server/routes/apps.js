const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/apps  — lista todos os apps com flag hasAccess para o usuário logado
router.get('/', requireAuth, (req, res) => {
  const apps = db.prepare('SELECT * FROM apps ORDER BY name').all()
  const perms = db.prepare('SELECT app_id FROM permissions WHERE user_id = ?').all(req.user.id)
  const myAppIds = new Set(perms.map(p => p.app_id))

  res.json(apps.map(a => ({
    ...a,
    active: !!a.active,
    hasAccess: myAppIds.has(a.id),
  })))
})

// POST /api/apps
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, description, url, icon, color, category, active } = req.body
  if (!name || !url) return res.status(400).json({ error: 'nome e url são obrigatórios' })
  const id = `app-${Date.now()}`
  const created_at = new Date().toISOString().split('T')[0]
  db.prepare(`INSERT INTO apps (id,name,description,url,icon,color,category,active,created_at)
              VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(id, name, description || '', url, icon || 'Globe', color || 'from-blue-500 to-cyan-500', category || 'Outros', active !== false ? 1 : 0, created_at)
  db.prepare('INSERT OR IGNORE INTO permissions (app_id, user_id) VALUES (?,?)').run(id, '1')
  res.status(201).json({ id })
})

// PUT /api/apps/:id
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const { name, description, url, icon, color, category, active } = req.body
  db.prepare(`UPDATE apps SET name=?,description=?,url=?,icon=?,color=?,category=?,active=? WHERE id=?`)
    .run(name, description, url, icon, color, category, active ? 1 : 0, req.params.id)
  res.json({ ok: true })
})

// DELETE /api/apps/:id
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM permissions WHERE app_id = ?').run(req.params.id)
  db.prepare('DELETE FROM apps WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// PATCH /api/apps/:id/toggle
router.patch('/:id/toggle', requireAuth, requireAdmin, (req, res) => {
  db.prepare('UPDATE apps SET active = CASE WHEN active=1 THEN 0 ELSE 1 END WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
