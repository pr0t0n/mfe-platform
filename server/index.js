const express = require('express')
const cors = require('cors')
const { init } = require('./db')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth',                require('./routes/auth'))
app.use('/api/apps',                require('./routes/apps'))
app.use('/api/users',               require('./routes/users'))
app.use('/api/permissions',         require('./routes/permissions'))
app.use('/api/sso',                 require('./routes/sso'))
app.use('/api/settings',            require('./routes/settings'))
app.use('/api/categories',          require('./routes/categories'))
app.use('/api/companies',           require('./routes/companies'))
app.use('/api/company-permissions', require('./routes/company-permissions'))
app.use('/api/requests',            require('./routes/requests'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

// Conecta ao PostgreSQL, migra schema e sobe o servidor
init()
  .then(() => {
    app.listen(PORT, () => console.log(`[api] CyberOps API rodando na porta ${PORT}`))

    // Job: revoga trials expirados a cada 1h
    const { query } = require('./db')
    async function revokeExpiredTrials () {
      const { rows } = await query("SELECT app_id, user_id FROM trial_access WHERE is_trial=true AND expires_at <= $1", [new Date().toISOString()])
      for (const { app_id, user_id } of rows) {
        await query('DELETE FROM permissions WHERE app_id=$1 AND user_id=$2', [app_id, user_id])
        await query('DELETE FROM trial_access WHERE app_id=$1 AND user_id=$2', [app_id, user_id])
      }
      if (rows.length > 0) console.log(`[trial] ${rows.length} acesso(s) expirado(s) revogados`)
    }
    revokeExpiredTrials()
    setInterval(revokeExpiredTrials, 3600 * 1000)
  })
  .catch(err => {
    console.error('[db] Falha na inicialização:', err.message)
    process.exit(1)
  })
