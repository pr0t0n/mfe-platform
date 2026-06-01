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

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => console.log(`[api] CyberOps API rodando na porta ${PORT}`))
