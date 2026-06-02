const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../db')
const requireAuth = require('../middleware/auth')

const router = express.Router()
const SSO_SECRET = process.env.SSO_SECRET || process.env.JWT_SECRET || 'cyberops-sso-secret-2025'

// POST /api/sso/token  — gera um token SSO de curta duração para um app específico
router.post('/token', requireAuth, (req, res) => {
  const { appId } = req.body
  if (!appId) return res.status(400).json({ error: 'appId obrigatório' })

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  const perm = db.prepare('SELECT 1 FROM permissions WHERE app_id=? AND user_id=?').get(appId, req.user.id)
  if (!perm && user.role !== 'admin') return res.status(403).json({ error: 'Sem acesso a este app' })

  const payload = {
    sub:        user.id,
    email:      user.email,
    name:       user.name,
    role:       user.role,
    department: user.department || '',
    company:    user.company || '',
    avatar:     user.avatar || '',
    app_id:     appId,
  }

  // Token válido por 1 hora
  const token = jwt.sign(payload, SSO_SECRET, { expiresIn: '1h', issuer: 'cyberops-hub' })
  res.json({ sso_token: token, expires_in: 3600 })
})

// GET /api/sso/verify?token=xxx  — endpoint público para apps alvo validarem o token
router.get('/verify', (req, res) => {
  const token = req.query.token
  if (!token) return res.status(400).json({ error: 'token obrigatório' })
  try {
    const payload = jwt.verify(token, SSO_SECRET, { issuer: 'cyberops-hub' })
    res.json({ valid: true, user: payload })
  } catch (e) {
    res.status(401).json({ valid: false, error: e.message })
  }
})

module.exports = router
