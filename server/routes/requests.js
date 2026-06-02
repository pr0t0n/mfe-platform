const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/requests  — admin: all; user: own
router.get('/', requireAuth, (req, res) => {
  const rows = req.user.role === 'admin'
    ? db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM requests WHERE user_id=? ORDER BY created_at DESC').all(req.user.id)
  res.json(rows)
})

// POST /api/requests
router.post('/', requireAuth, (req, res) => {
  const { appId, appName, message } = req.body
  const existing = db.prepare("SELECT id FROM requests WHERE user_id=? AND app_id=? AND status='pending'").get(req.user.id, appId)
  if (existing) return res.status(409).json({ error: 'Você já tem uma solicitação pendente para este app.' })

  const id = String(Date.now())
  db.prepare(`INSERT INTO requests (id,user_id,user_name,app_id,app_name,message,status,created_at)
              VALUES (?,?,?,?,?,?,'pending',?)`
  ).run(id, req.user.id, req.body.userName || '', appId, appName, message || '', new Date().toISOString())
  res.status(201).json({ id })
})

// PATCH /api/requests/:id/approve
router.patch('/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const request = db.prepare('SELECT * FROM requests WHERE id=?').get(req.params.id)
  if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' })

  const now = new Date().toISOString()
  db.prepare("UPDATE requests SET status='approved', resolved_at=? WHERE id=?").run(now, req.params.id)
  db.prepare('INSERT OR IGNORE INTO permissions (app_id, user_id) VALUES (?,?)').run(request.app_id, request.user_id)

  // Registra trial com data de expiração baseada em trial_days do app
  const app = db.prepare('SELECT trial_days FROM apps WHERE id=?').get(request.app_id)
  const trialDays = app?.trial_days ?? 30
  const expiresAt = new Date(Date.now() + trialDays * 86400000).toISOString()

  db.prepare(`
    INSERT INTO trial_access (id, app_id, user_id, granted_at, expires_at, is_trial)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(app_id, user_id) DO UPDATE SET granted_at=excluded.granted_at, expires_at=excluded.expires_at
  `).run(String(Date.now()), request.app_id, request.user_id, now, expiresAt)

  res.json({ ok: true, expires_at: expiresAt, trial_days: trialDays })
})

// PATCH /api/requests/:id/reject
router.patch('/:id/reject', requireAuth, requireAdmin, (req, res) => {
  db.prepare("UPDATE requests SET status='rejected', resolved_at=? WHERE id=?").run(new Date().toISOString(), req.params.id)
  res.json({ ok: true })
})

module.exports = router
