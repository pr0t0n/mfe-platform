const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://cyberops:cyberops2025@localhost:5432/cyberops',
  max: 10,
  idleTimeoutMillis: 30000,
})

// Helper: query com log de erros
async function query (sql, params = []) {
  const client = await pool.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}

// ── Schema ────────────────────────────────────────────────────────────────

async function migrate () {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'user',
      department  TEXT DEFAULT '',
      company     TEXT DEFAULT '',
      avatar      TEXT DEFAULT '',
      active      BOOLEAN NOT NULL DEFAULT true,
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS apps (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      description  TEXT DEFAULT '',
      url          TEXT NOT NULL,
      icon         TEXT DEFAULT 'Globe',
      color        TEXT DEFAULT 'from-blue-500 to-cyan-500',
      category     TEXT DEFAULT 'Outros',
      active       BOOLEAN NOT NULL DEFAULT true,
      sso_enabled  BOOLEAN NOT NULL DEFAULT false,
      trial_days   INTEGER NOT NULL DEFAULT 30,
      created_at   TEXT NOT NULL
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
      id    SERIAL PRIMARY KEY,
      name  TEXT NOT NULL UNIQUE,
      sort  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS companies (
      id    SERIAL PRIMARY KEY,
      name  TEXT NOT NULL UNIQUE,
      sort  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trial_access (
      id          TEXT PRIMARY KEY,
      app_id      TEXT NOT NULL,
      user_id     TEXT NOT NULL,
      granted_at  TEXT NOT NULL,
      expires_at  TEXT NOT NULL,
      is_trial    BOOLEAN NOT NULL DEFAULT true,
      UNIQUE(app_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_permissions (
      company_name  TEXT NOT NULL,
      app_id        TEXT NOT NULL,
      PRIMARY KEY (company_name, app_id)
    );
  `)
  console.log('[db] Schema OK')
}

// ── Seed por tabela (INSERT OR IGNORE equivalente no PostgreSQL) ─────────────

async function seedIfEmpty (table, rows, insertFn) {
  const { rows: r } = await query(`SELECT COUNT(*) AS n FROM ${table}`)
  if (parseInt(r[0].n) > 0) return
  console.log(`[db] Populando ${table}...`)
  for (const row of rows) await insertFn(row)
}

async function seed () {
  const { rows: r } = await query('SELECT COUNT(*) AS n FROM users')
  const userCount = parseInt(r[0].n)

  if (userCount > 0) {
    console.log(`[db] Banco existente: ${userCount} usuário(s). Seed de usuários/apps ignorado.`)
  } else {
    console.log('[db] Banco vazio — executando seed inicial...')
    const hash = (p) => bcrypt.hashSync(p, 10)
    const mkAvatar = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const now = new Date().toISOString().split('T')[0]

    const USERS = [
      { id:'1', name:'Admin Geral',    email:'admin@empresa.com',  password:'admin123', role:'admin', department:'TI',        company:'VALID' },
      { id:'2', name:'João Silva',     email:'joao@empresa.com',   password:'123456',   role:'user',  department:'Comercial',  company:'VALID' },
      { id:'3', name:'Maria Santos',   email:'maria@empresa.com',  password:'123456',   role:'user',  department:'Financeiro', company:'VALID' },
      { id:'4', name:'Carlos Pereira', email:'carlos@empresa.com', password:'123456',   role:'user',  department:'RH',         company:'VALID' },
      { id:'5', name:'Ana Lima',       email:'ana@empresa.com',    password:'123456',   role:'user',  department:'Marketing',  company:'VALID', active:false },
    ]
    for (const u of USERS) {
      await query(
        `INSERT INTO users (id,name,email,password,role,department,company,avatar,active,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,
        [u.id, u.name, u.email, hash(u.password), u.role, u.department, u.company,
         mkAvatar(u.name), u.active !== false, now]
      )
    }

    const APPS = [
      { id:'app-1', name:'BI Analytics',      description:'Dashboards e relatórios estratégicos em tempo real.',    url:'https://analytics.empresa.com', icon:'BarChart3', color:'from-blue-500 to-cyan-500',     category:'Analytics', trial_days:30 },
      { id:'app-2', name:'CRM Vendas',         description:'Gestão de clientes, leads e pipeline de vendas.',        url:'https://crm.empresa.com',        icon:'Users',     color:'from-violet-500 to-purple-600', category:'CRM',       trial_days:30 },
      { id:'app-3', name:'ERP Financeiro',     description:'Controle financeiro, contabilidade e orçamentos.',       url:'https://erp.empresa.com',        icon:'DollarSign',color:'from-emerald-500 to-teal-600',  category:'ERP',       trial_days:15 },
      { id:'app-4', name:'RH & Talentos',      description:'Gestão de pessoas, recrutamento e desenvolvimento.',     url:'https://rh.empresa.com',         icon:'UserCheck', color:'from-orange-400 to-rose-500',   category:'RH',        trial_days:30 },
      { id:'app-5', name:'Marketing Hub',      description:'Campanhas, automação e análise de desempenho.',          url:'https://marketing.empresa.com',  icon:'Megaphone', color:'from-pink-500 to-rose-600',     category:'Marketing', trial_days:7  },
      { id:'app-7', name:'DevOps Portal',      description:'Deploy, monitoramento e infraestrutura de aplicações.',  url:'https://devops.empresa.com',     icon:'Terminal',  color:'from-slate-600 to-slate-800',   category:'TI',        trial_days:30 },
      { id:'app-8', name:'Legal & Compliance', description:'Contratos, documentos legais e conformidade regulatória.',url:'https://legal.empresa.com',    icon:'Scale',     color:'from-indigo-500 to-blue-700',   category:'Jurídico',  trial_days:30 },
    ]
    const DEFAULT_PERMS = { 'app-1':['1','2','3'],'app-2':['1','2'],'app-3':['1','3'],'app-4':['1'],'app-5':['1'],'app-7':['1'],'app-8':['1'] }
    for (const app of APPS) {
      await query(
        `INSERT INTO apps (id,name,description,url,icon,color,category,active,sso_enabled,trial_days,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true,false,$8,$9) ON CONFLICT DO NOTHING`,
        [app.id, app.name, app.description, app.url, app.icon, app.color, app.category, app.trial_days, now]
      )
      for (const uid of (DEFAULT_PERMS[app.id] || ['1'])) {
        await query('INSERT INTO permissions (app_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [app.id, uid])
      }
    }
    console.log('[db] Seed de usuários e apps concluído.')
  }

  // Seeds independentes — sempre rodam se tabela vazia
  await seedIfEmpty('categories',
    ['Analytics','CRM','ERP','RH','Marketing','Logística','TI','Jurídico','Outros'],
    (name, idx) => query('INSERT INTO categories (name,sort) VALUES ($1,$2) ON CONFLICT DO NOTHING', [name, idx])
  )
  // Fix: seedIfEmpty passes (row, index) — reconfigure
  await (async () => {
    const { rows: r } = await query('SELECT COUNT(*) AS n FROM categories')
    if (parseInt(r[0].n) > 0) return
    const cats = ['Analytics','CRM','ERP','RH','Marketing','Logística','TI','Jurídico','Outros']
    for (let i = 0; i < cats.length; i++) await query('INSERT INTO categories (name,sort) VALUES ($1,$2) ON CONFLICT DO NOTHING',[cats[i],i])
  })()

  await (async () => {
    const { rows: r } = await query('SELECT COUNT(*) AS n FROM companies')
    if (parseInt(r[0].n) > 0) return
    console.log('[db] Populando companies...')
    const cos = ['VALID','Cliente A','Cliente B','Parceiro']
    for (let i = 0; i < cos.length; i++) await query('INSERT INTO companies (name,sort) VALUES ($1,$2) ON CONFLICT DO NOTHING',[cos[i],i])
  })()

  await (async () => {
    const { rows: r } = await query('SELECT COUNT(*) AS n FROM settings')
    if (parseInt(r[0].n) > 0) return
    console.log('[db] Populando settings...')
    const defaults = [['sso_global_enabled','1'],['trial_default_days','30'],['platform_name','CyberOps HUB'],['platform_subtitle','Plataforma de Cyber Security VALID']]
    for (const [k,v] of defaults) await query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT DO NOTHING',[k,v])
  })()
}

async function init () {
  await migrate()
  await seed()
  console.log('[db] PostgreSQL pronto.')
}

module.exports = { pool, query, init }
