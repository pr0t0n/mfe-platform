const jwt = require('jsonwebtoken')
const { SECRET } = require('../routes/auth')

module.exports = function requireAuth (req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

module.exports.requireAdmin = function requireAdmin (req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito a administradores.' })
  next()
}
