const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort, name').all())
})

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' })
  try {
    const maxSort = db.prepare('SELECT MAX(sort) as m FROM categories').get().m ?? 0
    db.prepare('INSERT INTO categories (name, sort) VALUES (?,?)').run(name.trim(), maxSort + 1)
    res.status(201).json({ ok: true })
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Categoria já existe.' })
    throw e
  }
})

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' })
  db.prepare('UPDATE categories SET name=? WHERE id=?').run(name.trim(), req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
