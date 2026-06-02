const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'cyberops.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema completo ──────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',
    department  TEXT DEFAULT '',
    company     TEXT DEFAULT '',
    avatar      TEXT DEFAULT '',
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS apps (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    url         TEXT NOT NULL,
    icon        TEXT DEFAULT 'Globe',
    color       TEXT DEFAULT 'from-blue-500 to-cyan-500',
    category    TEXT DEFAULT 'Outros',
    active      INTEGER NOT NULL DEFAULT 1,
    sso_enabled INTEGER NOT NULL DEFAULT 0,
    trial_days  INTEGER NOT NULL DEFAULT 30,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS permissions (
    app_id  TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (app_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS requests (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    user_name   TEXT NOT NULL,
    app_id      TEXT NOT NULL,
    app_name    TEXT NOT NULL,
    message     TEXT DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TEXT NOT NULL,
    resolved_at TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE,
    sort  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS companies (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE,
    sort  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS trial_access (
    id          TEXT PRIMARY KEY,
    app_id      TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    granted_at  TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    is_trial    INTEGER NOT NULL DEFAULT 1,
    UNIQUE(app_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Permissões de acesso no nível de empresa
  -- Todos os usuários da empresa herdam esses acessos automaticamente
  CREATE TABLE IF NOT EXISTS company_permissions (
    company_name  TEXT NOT NULL,
    app_id        TEXT NOT NULL,
    PRIMARY KEY (company_name, app_id)
  );
`)

// Migrations para colunas adicionadas após criação inicial (idempotentes)
const migrate = (sql) => { try { db.exec(sql) } catch (_) {} }
migrate("ALTER TABLE users ADD COLUMN company TEXT DEFAULT ''")
migrate("ALTER TABLE apps ADD COLUMN sso_enabled INTEGER DEFAULT 0")
migrate("ALTER TABLE apps ADD COLUMN trial_days INTEGER DEFAULT 30")

// ── Seed ────────────────────────────────────────────────────────────────────

function seed () {
  const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n
  if (userCount > 0) {
    // Banco já tem dados — NUNCA sobrescreve registros existentes
    console.log(`[db] Banco existente: ${userCount} usuário(s). Seed ignorado.`)
    return
  }
  console.log('[db] Banco vazio — executando seed inicial...')

  const now = new Date().toISOString()
  const hash = (p) => bcrypt.hashSync(p, 10)
  const mkAvatar = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const USERS = [
    { id: '1', name: 'Admin Geral',    email: 'admin@empresa.com',  password: 'admin123', role: 'admin', department: 'TI',        company: 'VALID', active: 1 },
    { id: '2', name: 'João Silva',     email: 'joao@empresa.com',   password: '123456',   role: 'user',  department: 'Comercial',  company: 'VALID', active: 1 },
    { id: '3', name: 'Maria Santos',   email: 'maria@empresa.com',  password: '123456',   role: 'user',  department: 'Financeiro', company: 'VALID', active: 1 },
    { id: '4', name: 'Carlos Pereira', email: 'carlos@empresa.com', password: '123456',   role: 'user',  department: 'RH',         company: 'VALID', active: 1 },
    { id: '5', name: 'Ana Lima',       email: 'ana@empresa.com',    password: '123456',   role: 'user',  department: 'Marketing',  company: 'VALID', active: 0 },
  ]

  const insertUser = db.prepare(`
    INSERT INTO users (id,name,email,password,role,department,company,avatar,active,created_at)
    VALUES (@id,@name,@email,@password,@role,@department,@company,@avatar,@active,@created_at)
  `)
  for (const u of USERS) {
    insertUser.run({ ...u, password: hash(u.password), avatar: mkAvatar(u.name), created_at: now.split('T')[0] })
  }

  const APPS = [
    { id:'app-1', name:'BI Analytics',      description:'Dashboards e relatórios estratégicos em tempo real.',    url:'https://analytics.empresa.com', icon:'BarChart3', color:'from-blue-500 to-cyan-500',     category:'Analytics', active:1, trial_days:30 },
    { id:'app-2', name:'CRM Vendas',         description:'Gestão de clientes, leads e pipeline de vendas.',        url:'https://crm.empresa.com',        icon:'Users',     color:'from-violet-500 to-purple-600', category:'CRM',       active:1, trial_days:30 },
    { id:'app-3', name:'ERP Financeiro',     description:'Controle financeiro, contabilidade e orçamentos.',       url:'https://erp.empresa.com',        icon:'DollarSign',color:'from-emerald-500 to-teal-600',  category:'ERP',       active:1, trial_days:15 },
    { id:'app-4', name:'RH & Talentos',      description:'Gestão de pessoas, recrutamento e desenvolvimento.',     url:'https://rh.empresa.com',         icon:'UserCheck', color:'from-orange-400 to-rose-500',   category:'RH',        active:1, trial_days:30 },
    { id:'app-5', name:'Marketing Hub',      description:'Campanhas, automação e análise de desempenho.',          url:'https://marketing.empresa.com',  icon:'Megaphone', color:'from-pink-500 to-rose-600',     category:'Marketing', active:1, trial_days:7  },
    { id:'app-6', name:'Supply Chain',       description:'Gestão de estoque, logística e cadeia de suprimentos.',  url:'https://supply.empresa.com',     icon:'Package',   color:'from-amber-500 to-orange-600',  category:'Logística', active:1, trial_days:30 },
    { id:'app-7', name:'DevOps Portal',      description:'Deploy, monitoramento e infraestrutura de aplicações.',  url:'https://devops.empresa.com',     icon:'Terminal',  color:'from-slate-600 to-slate-800',   category:'TI',        active:1, trial_days:30 },
    { id:'app-8', name:'Legal & Compliance', description:'Contratos, documentos legais e conformidade regulatória.',url:'https://legal.empresa.com',    icon:'Scale',     color:'from-indigo-500 to-blue-700',   category:'Jurídico',  active:1, trial_days:30 },
  ]

  const insertApp = db.prepare(`
    INSERT INTO apps (id,name,description,url,icon,color,category,active,sso_enabled,trial_days,created_at)
    VALUES (@id,@name,@description,@url,@icon,@color,@category,@active,0,@trial_days,@created_at)
  `)
  const insertPerm = db.prepare('INSERT OR IGNORE INTO permissions (app_id, user_id) VALUES (?,?)')
  const DEFAULT_PERMS = { 'app-1':['1','2','3'],'app-2':['1','2'],'app-3':['1','3'],'app-4':['1'],'app-5':['1'],'app-6':['1'],'app-7':['1'],'app-8':['1'] }

  for (const app of APPS) {
    insertApp.run({ ...app, created_at: now.split('T')[0] })
    for (const uid of (DEFAULT_PERMS[app.id] || ['1'])) insertPerm.run(app.id, uid)
  }

  // Seed settings defaults
  const insSetting = db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)')
  insSetting.run('sso_global_enabled', '1')       // SSO JWT global: ativo por padrão
  insSetting.run('trial_default_days', '30')       // Degustação padrão em dias
  insSetting.run('platform_name', 'CyberOps HUB') // Nome da plataforma
  insSetting.run('platform_subtitle', 'Plataforma de Cyber Security VALID')

  // Seed categorias
  const cats = ['Analytics','CRM','ERP','RH','Marketing','Logística','TI','Jurídico','Outros']
  const insCat = db.prepare('INSERT OR IGNORE INTO categories (name,sort) VALUES (?,?)')
  cats.forEach((c, i) => insCat.run(c, i))

  // Seed empresas
  const companies = ['VALID','Cliente A','Cliente B','Parceiro']
  const insCo = db.prepare('INSERT OR IGNORE INTO companies (name,sort) VALUES (?,?)')
  companies.forEach((c, i) => insCo.run(c, i))

  console.log('[db] Seed concluído.')
}

seed()

// ── Seeds independentes: sempre populam se a tabela estiver vazia ────────────
// Não dependem de userCount — executam mesmo quando banco já tem outros dados.

function seedIfEmpty (table, inserts) {
  const count = db.prepare(`SELECT COUNT(*) as n FROM ${table}`).get().n
  if (count > 0) return
  console.log(`[db] Populando ${table}...`)
  inserts()
}

seedIfEmpty('categories', () => {
  const ins = db.prepare('INSERT OR IGNORE INTO categories (name,sort) VALUES (?,?)')
  ;['Analytics','CRM','ERP','RH','Marketing','Logística','TI','Jurídico','Outros'].forEach((c, i) => ins.run(c, i))
})

seedIfEmpty('companies', () => {
  const ins = db.prepare('INSERT OR IGNORE INTO companies (name,sort) VALUES (?,?)')
  ;['VALID','Cliente A','Cliente B','Parceiro'].forEach((c, i) => ins.run(c, i))
})

seedIfEmpty('settings', () => {
  const ins = db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)')
  ins.run('sso_global_enabled', '1')
  ins.run('trial_default_days', '30')
  ins.run('platform_name', 'CyberOps HUB')
  ins.run('platform_subtitle', 'Plataforma de Cyber Security VALID')
})

module.exports = db
