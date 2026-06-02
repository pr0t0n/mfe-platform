const express = require('express')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = req.user.role === 'admin'
      ? await query('SELECT * FROM requests ORDER BY created_at DESC')
      : await query('SELECT * FROM requests WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { appId, appName, message, userName } = req.body
    const { rows } = await query("SELECT id FROM requests WHERE user_id=$1 AND app_id=$2 AND status='pending'", [req.user.id, appId])
    if (rows.length > 0) return res.status(409).json({ error: 'Você já tem uma solicitação pendente para este app.' })
    const id = String(Date.now())
    await query(
      "INSERT INTO requests (id,user_id,user_name,app_id,app_name,message,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7)",
      [id, req.user.id, userName||'', appId, appName, message||'', new Date().toISOString()]
    )
    res.status(201).json({ id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM requests WHERE id=$1', [req.params.id])
    const request = rows[0]
    if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' })

    const now = new Date().toISOString()
    await query("UPDATE requests SET status='approved', resolved_at=$1 WHERE id=$2", [now, req.params.id])
    await query('INSERT INTO permissions (app_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [request.app_id, request.user_id])

    const { rows: appRows } = await query('SELECT trial_days FROM apps WHERE id=$1', [request.app_id])
    const trialDays = appRows[0]?.trial_days || 30
    const expiresAt = new Date(Date.now() + trialDays * 86400000).toISOString()

    await query(
      `INSERT INTO trial_access (id,app_id,user_id,granted_at,expires_at,is_trial) VALUES ($1,$2,$3,$4,$5,true)
       ON CONFLICT (app_id,user_id) DO UPDATE SET granted_at=$4, expires_at=$5`,
      [String(Date.now()), request.app_id, request.user_id, now, expiresAt]
    )
    res.json({ ok: true, expires_at: expiresAt, trial_days: trialDays })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query("UPDATE requests SET status='rejected', resolved_at=$1 WHERE id=$2", [new Date().toISOString(), req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
