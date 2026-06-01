const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/permissions  — { app_id: [user_id, ...] }
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT app_id, user_id FROM permissions').all()
  const map = {}
  for (const { app_id, user_id } of rows) {
    if (!map[app_id]) map[app_id] = []
    map[app_id].push(user_id)
  }
  res.json(map)
})

// POST /api/permissions/grant
router.post('/grant', requireAuth, requireAdmin, (req, res) => {
  const { appId, userId } = req.body
  db.prepare('INSERT OR IGNORE INTO permissions (app_id, user_id) VALUES (?,?)').run(appId, userId)
  res.json({ ok: true })
})

// POST /api/permissions/revoke
router.post('/revoke', requireAuth, requireAdmin, (req, res) => {
  const { appId, userId } = req.body
  db.prepare('DELETE FROM permissions WHERE app_id=? AND user_id=?').run(appId, userId)
  res.json({ ok: true })
})

module.exports = router
