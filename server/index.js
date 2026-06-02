const express = require('express')
const cors = require('cors')

require('./db') // init + seed

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth',        require('./routes/auth'))
app.use('/api/apps',        require('./routes/apps'))
app.use('/api/users',       require('./routes/users'))
app.use('/api/permissions', require('./routes/permissions'))
app.use('/api/requests',    require('./routes/requests'))
app.use('/api/categories',  require('./routes/categories'))
app.use('/api/companies',   require('./routes/companies'))
app.use('/api/sso',         require('./routes/sso'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ── Job: revoga acessos de degustação expirados ──────────────────────────────
function revokeExpiredTrials () {
  const db = require('./db')
  const now = new Date().toISOString()
  const expired = db.prepare(
    "SELECT app_id, user_id FROM trial_access WHERE is_trial=1 AND expires_at <= ?"
  ).all(now)
  if (expired.length > 0) {
    const revoke = db.prepare('DELETE FROM permissions WHERE app_id=? AND user_id=?')
    const markRevoked = db.prepare("DELETE FROM trial_access WHERE app_id=? AND user_id=?")
    for (const { app_id, user_id } of expired) {
      revoke.run(app_id, user_id)
      markRevoked.run(app_id, user_id)
    }
    console.log(`[trial] ${expired.length} acesso(s) expirado(s) revogados`)
  }
}

revokeExpiredTrials()
setInterval(revokeExpiredTrials, 3600 * 1000) // a cada 1h

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => console.log(`[api] CyberOps API rodando na porta ${PORT}`))
