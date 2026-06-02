const express = require('express')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows: companies } = await query('SELECT name FROM companies ORDER BY sort, name')
    const { rows } = await query('SELECT company_name, app_id FROM company_permissions')
    const map = {}
    for (const { name } of companies) map[name] = []
    for (const { company_name, app_id } of rows) {
      if (!map[company_name]) map[company_name] = []
      map[company_name].push(app_id)
    }
    res.json(map)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/grant', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { company, appId } = req.body
    if (!company || !appId) return res.status(400).json({ error: 'company e appId obrigatórios' })
    await query('INSERT INTO company_permissions (company_name,app_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [company, appId])
    const { rows: users } = await query('SELECT id FROM users WHERE company=$1 AND active=true', [company])
    for (const { id } of users) {
      await query('INSERT INTO permissions (app_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [appId, id])
    }
    res.json({ ok: true, users_updated: users.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/revoke', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { company, appId } = req.body
    await query('DELETE FROM company_permissions WHERE company_name=$1 AND app_id=$2', [company, appId])
    const { rows: users } = await query('SELECT id FROM users WHERE company=$1', [company])
    for (const { id } of users) {
      await query('DELETE FROM permissions WHERE app_id=$1 AND user_id=$2', [appId, id])
    }
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
