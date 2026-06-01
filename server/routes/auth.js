const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

const router = express.Router()
const SECRET = process.env.JWT_SECRET || 'cyberops-secret-2025'

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email.toLowerCase().trim())
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos, ou usuário inativo.' })
  }

  const { password: _, ...safeUser } = user
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '8h' })
  res.json({ token, user: safeUser })
})

router.post('/logout', (_req, res) => res.json({ ok: true }))

module.exports = router
module.exports.SECRET = SECRET
