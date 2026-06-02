const express = require('express')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows: apps } = await query('SELECT * FROM apps ORDER BY name')
    const { rows: perms } = await query('SELECT app_id FROM permissions WHERE user_id=$1', [req.user.id])
    const { rows: trials } = await query('SELECT app_id, granted_at, expires_at, is_trial FROM trial_access WHERE user_id=$1', [req.user.id])
    const myIds = new Set(perms.map(p => p.app_id))
    const trialMap = {}
    for (const t of trials) trialMap[t.app_id] = t
    res.json(apps.map(a => ({ ...a, hasAccess: myIds.has(a.id), trial: trialMap[a.id] || null })))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, url, icon, color, category, active, trial_days } = req.body
    if (!name || !url) return res.status(400).json({ error: 'nome e url são obrigatórios' })
    const id = `app-${Date.now()}`
    const now = new Date().toISOString().split('T')[0]
    await query(
      `INSERT INTO apps (id,name,description,url,icon,color,category,active,sso_enabled,trial_days,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,$10)`,
      [id, name, description||'', url, icon||'Globe', color||'from-blue-500 to-cyan-500', category||'Outros', active!==false, trial_days||30, now]
    )
    await query('INSERT INTO permissions (app_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, '1'])
    res.status(201).json({ id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, url, icon, color, category, active, trial_days } = req.body
    await query(
      'UPDATE apps SET name=$1,description=$2,url=$3,icon=$4,color=$5,category=$6,active=$7,trial_days=$8 WHERE id=$9',
      [name, description, url, icon, color, category, !!active, trial_days||30, req.params.id]
    )
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM permissions WHERE app_id=$1', [req.params.id])
    await query('DELETE FROM apps WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('UPDATE apps SET active = NOT active WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:id/toggle-sso', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('UPDATE apps SET sso_enabled = NOT sso_enabled WHERE id=$1', [req.params.id])
    const { rows } = await query('SELECT sso_enabled FROM apps WHERE id=$1', [req.params.id])
    res.json({ ok: true, sso_enabled: rows[0]?.sso_enabled })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
