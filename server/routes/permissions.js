const express = require('express')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await query('SELECT app_id, user_id FROM permissions')
    const map = {}
    for (const { app_id, user_id } of rows) {
      if (!map[app_id]) map[app_id] = []
      map[app_id].push(user_id)
    }
    res.json(map)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/grant', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { appId, userId } = req.body
    await query('INSERT INTO permissions (app_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [appId, userId])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/revoke', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { appId, userId } = req.body
    await query('DELETE FROM permissions WHERE app_id=$1 AND user_id=$2', [appId, userId])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
