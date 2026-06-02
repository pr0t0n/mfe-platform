const express = require('express')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

const DEFAULTS = [['sso_global_enabled','1'],['trial_default_days','30'],['platform_name','CyberOps HUB'],['platform_subtitle','Plataforma de Cyber Security VALID']]

router.get('/', requireAuth, async (_req, res) => {
  try {
    for (const [k,v] of DEFAULTS) await query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT DO NOTHING',[k,v])
    const { rows } = await query('SELECT key, value FROM settings')
    const map = {}
    for (const { key, value } of rows) map[key] = value
    res.json(map)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body || {})) {
      await query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',[key, String(value)])
    }
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/:key/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT value FROM settings WHERE key=$1', [req.params.key])
    const next = rows[0]?.value === '1' ? '0' : '1'
    await query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',[req.params.key, next])
    res.json({ ok: true, value: next })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
