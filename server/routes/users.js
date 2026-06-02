const express = require('express')
const bcrypt = require('bcryptjs')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()
const safe = (u) => { const { password: _, ...r } = u; return r }

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users ORDER BY name')
    res.json(rows.map(safe))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, department, company } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' })
    const avatar = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    const id = String(Date.now())
    const now = new Date().toISOString().split('T')[0]
    await query(
      `INSERT INTO users (id,name,email,password,role,department,company,avatar,active,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)`,
      [id, name, email.toLowerCase().trim(), bcrypt.hashSync(password, 10), role||'user', department||'', company||'', avatar, now]
    )
    // Herda permissões da empresa
    if (company) {
      const { rows: cpRows } = await query('SELECT app_id FROM company_permissions WHERE company_name=$1', [company])
      for (const { app_id } of cpRows) {
        await query('INSERT INTO permissions (app_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [app_id, id])
      }
    }
    res.status(201).json({ id })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado.' })
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, department, company } = req.body
    const avatar = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    await query('UPDATE users SET name=$1,email=$2,role=$3,department=$4,company=$5,avatar=$6 WHERE id=$7',
      [name, email.toLowerCase().trim(), role, department, company||'', avatar, req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('UPDATE users SET active = NOT active WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
