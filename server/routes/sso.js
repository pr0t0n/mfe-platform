const express = require('express')
const jwt = require('jsonwebtoken')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')

const router = express.Router()
const SSO_SECRET = process.env.SSO_SECRET || process.env.JWT_SECRET || 'cyberops-sso-secret-2025'

router.post('/token', requireAuth, async (req, res) => {
  try {
    const { appId } = req.body
    if (!appId) return res.status(400).json({ error: 'appId obrigatório' })

    const { rows: setting } = await query("SELECT value FROM settings WHERE key='sso_global_enabled'")
    if (setting[0]?.value === '0') return res.status(403).json({ error: 'SSO desativado globalmente.' })

    const { rows: users } = await query('SELECT * FROM users WHERE id=$1', [req.user.id])
    const user = users[0]
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    if (user.role !== 'admin') {
      const { rows: perm } = await query('SELECT 1 FROM permissions WHERE app_id=$1 AND user_id=$2', [appId, req.user.id])
      if (perm.length === 0) return res.status(403).json({ error: 'Sem acesso a este app' })
    }

    const token = jwt.sign({
      sub: user.id, email: user.email, name: user.name,
      role: user.role, department: user.department||'', company: user.company||'',
      avatar: user.avatar||'', app_id: appId,
    }, SSO_SECRET, { expiresIn: '1h', issuer: 'cyberops-hub' })

    res.json({ sso_token: token, expires_in: 3600 })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.get('/verify', async (req, res) => {
  try {
    const token = req.query.token
    if (!token) return res.status(400).json({ error: 'token obrigatório' })
    const payload = jwt.verify(token, SSO_SECRET, { issuer: 'cyberops-hub' })
    res.json({ valid: true, user: payload })
  } catch (e) {
    res.status(401).json({ valid: false, error: e.message })
  }
})

module.exports = router
