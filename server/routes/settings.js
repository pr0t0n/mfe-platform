const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Garante seed de settings se tabela vazia
function ensureDefaults () {
  const ins = db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)')
  ins.run('sso_global_enabled', '1')
  ins.run('trial_default_days', '30')
  ins.run('platform_name', 'CyberOps HUB')
  ins.run('platform_subtitle', 'Plataforma de Cyber Security VALID')
}

// GET /api/settings  — retorna { key: value, ... }
router.get('/', requireAuth, (req, res) => {
  ensureDefaults()
  const rows = db.prepare('SELECT key, value FROM settings').all()
  const map = {}
  for (const { key, value } of rows) map[key] = value
  res.json(map)
})

// PUT /api/settings  — salva { key: value, ... }
router.put('/', requireAuth, requireAdmin, (req, res) => {
  const upsert = db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
  const updateAll = db.transaction((entries) => {
    for (const [key, value] of entries) upsert.run(key, String(value))
  })
  updateAll(Object.entries(req.body || {}))
  res.json({ ok: true })
})

// PATCH /api/settings/:key/toggle  — inverte boolean (0↔1)
router.patch('/:key/toggle', requireAuth, requireAdmin, (req, res) => {
  const current = db.prepare('SELECT value FROM settings WHERE key=?').get(req.params.key)
  const next = current?.value === '1' ? '0' : '1'
  db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .run(req.params.key, next)
  res.json({ ok: true, value: next })
})

module.exports = router
