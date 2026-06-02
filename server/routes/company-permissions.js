const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/company-permissions
// Retorna { "VALID": ["app-1","app-2"], "Cliente A": [] }
router.get('/', requireAuth, requireAdmin, (_req, res) => {
  const companies = db.prepare('SELECT name FROM companies ORDER BY sort, name').all()
  const rows = db.prepare('SELECT company_name, app_id FROM company_permissions').all()

  const map = {}
  for (const { name } of companies) map[name] = []
  for (const { company_name, app_id } of rows) {
    if (!map[company_name]) map[company_name] = []
    map[company_name].push(app_id)
  }
  res.json(map)
})

// POST /api/company-permissions/grant
// { company, appId }
router.post('/grant', requireAuth, requireAdmin, (req, res) => {
  const { company, appId } = req.body
  if (!company || !appId) return res.status(400).json({ error: 'company e appId obrigatórios' })
  db.prepare('INSERT OR IGNORE INTO company_permissions (company_name, app_id) VALUES (?,?)').run(company, appId)

  // Concede acesso a todos os usuários ativos da empresa que ainda não têm acesso
  const users = db.prepare("SELECT id FROM users WHERE company=? AND active=1").all(company)
  const ins = db.prepare('INSERT OR IGNORE INTO permissions (app_id, user_id) VALUES (?,?)')
  for (const { id } of users) ins.run(appId, id)

  res.json({ ok: true, users_updated: users.length })
})

// POST /api/company-permissions/revoke
// { company, appId }
router.post('/revoke', requireAuth, requireAdmin, (req, res) => {
  const { company, appId } = req.body
  db.prepare('DELETE FROM company_permissions WHERE company_name=? AND app_id=?').run(company, appId)

  // Remove acesso de todos os usuários da empresa que receberam via empresa
  // (não remove quem recebeu permissão individual — verificação simplificada: remove todos)
  const users = db.prepare("SELECT id FROM users WHERE company=?").all(company)
  const del = db.prepare('DELETE FROM permissions WHERE app_id=? AND user_id=?')
  for (const { id } of users) del.run(appId, id)

  res.json({ ok: true })
})

// Quando um novo usuário é criado na empresa, herda as permissões da empresa
function applyCompanyPermissions (userId, company) {
  if (!company) return
  const appIds = db.prepare('SELECT app_id FROM company_permissions WHERE company_name=?').all(company)
  const ins = db.prepare('INSERT OR IGNORE INTO permissions (app_id, user_id) VALUES (?,?)')
  for (const { app_id } of appIds) ins.run(app_id, userId)
}

module.exports = router
module.exports.applyCompanyPermissions = applyCompanyPermissions
