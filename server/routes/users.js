const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

const safe = (u) => { const { password: _, ...rest } = u; rest.active = !!rest.active; return rest }

router.get('/', requireAuth, requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM users ORDER BY name').all().map(safe))
})

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, email, password, role, department } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' })
  const avatar = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const id = String(Date.now())
  try {
    db.prepare(`INSERT INTO users (id,name,email,password,role,department,avatar,active,created_at)
                VALUES (?,?,?,?,?,?,?,1,?)`
    ).run(id, name, email.toLowerCase().trim(), bcrypt.hashSync(password, 10), role || 'user', department || '', avatar, new Date().toISOString().split('T')[0])
    res.status(201).json({ id })
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'E-mail já cadastrado.' })
    throw e
  }
})

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const { name, email, role, department } = req.body
  const avatar = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  db.prepare('UPDATE users SET name=?,email=?,role=?,department=?,avatar=? WHERE id=?')
    .run(name, email.toLowerCase().trim(), role, department, avatar, req.params.id)
  res.json({ ok: true })
})

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

router.patch('/:id/toggle', requireAuth, requireAdmin, (req, res) => {
  db.prepare('UPDATE users SET active = CASE WHEN active=1 THEN 0 ELSE 1 END WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
