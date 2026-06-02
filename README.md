# CyberOps HUB — Plataforma de Micro Frontends

> Plataforma corporativa para centralizar o acesso a micro-frontends com controle de permissões, SSO via JWT e degustação por tempo. Desenvolvida para **VALID Certificadora**.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Início Rápido com Docker](#início-rápido-com-docker)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Funcionalidades](#funcionalidades)
- [SSO — Integração com Apps](#sso--integração-com-apps)
- [Banco de Dados](#banco-de-dados)
- [API Reference](#api-reference)
- [Persistência e Backup](#persistência-e-backup)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  Browser → localhost:8080                               │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  nginx (cyberops-frontend)                       │   │
│  │  • Serve arquivos estáticos do React (SPA)       │   │
│  │  • Proxy reverso: /api/* → api:3001              │   │
│  └─────────────────────┬────────────────────────────┘   │
│                        │ proxy                          │
│  ┌─────────────────────▼────────────────────────────┐   │
│  │  Node.js / Express (cyberops-api)                │   │
│  │  • REST API completa                             │   │
│  │  • Autenticação JWT (bcrypt + jsonwebtoken)      │   │
│  │  • SQLite via better-sqlite3                     │   │
│  └─────────────────────┬────────────────────────────┘   │
│                        │                                │
│  ┌─────────────────────▼────────────────────────────┐   │
│  │  Volume Docker: cyberops-db                      │   │
│  │  • /data/cyberops.db (SQLite WAL)                │   │
│  │  • Persiste entre reinicializações               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Stack:**
| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router 6 |
| UI State | Zustand (sessão do usuário apenas) |
| Backend | Node.js 22, Express 5 |
| Banco | SQLite 3 via `better-sqlite3` |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Container | Docker + Docker Compose |
| Proxy | nginx 1.27 (reverse proxy + SPA fallback) |

---

## Requisitos

- **Docker** 24+ e **Docker Compose** v2+
- Portas livres: `8080` (frontend) — a API fica interna via proxy

Para desenvolvimento local, adicionalmente:
- **Node.js** 20+
- **npm** 9+

---

## Início Rápido com Docker

```bash
# Clone o repositório
git clone https://github.com/pr0t0n/mfe-platform.git
cd mfe-platform

# (Opcional) copie e ajuste variáveis
cp .env.example .env

# Suba todos os serviços
docker compose up -d

# Acesse
# Frontend: http://localhost:8080
# API:      http://localhost:8080/api/health
```

**Credenciais iniciais:**
| Usuário | Email | Senha | Perfil |
|---|---|---|---|
| Admin Geral | `admin@empresa.com` | `admin123` | Administrador |
| João Silva | `joao@empresa.com` | `123456` | Usuário |
| Maria Santos | `maria@empresa.com` | `123456` | Usuário |

> **Importante:** Troque as senhas após o primeiro login em produção.

---

## Desenvolvimento Local

```bash
# 1. Instale dependências do frontend
npm install

# 2. Instale dependências do backend
cd server && npm install && cd ..

# 3. Configure variável de ambiente do frontend
echo "VITE_API_URL=http://localhost:3001" > .env.local

# 4. Inicie o backend
node server/index.js &

# 5. Inicie o frontend
npm run dev
# → http://localhost:5173
```

---

## Variáveis de Ambiente

### `.env` (raiz do projeto, para Docker)

```env
# Porta do frontend (padrão: 8080)
PORT=8080

# Chave secreta para tokens JWT de autenticação
JWT_SECRET=troque-por-uma-chave-forte-aqui

# Chave secreta para tokens SSO
SSO_SECRET=troque-por-uma-chave-sso-forte-aqui
```

### `.env.local` (apenas desenvolvimento local)

```env
# URL da API para o frontend no dev server
VITE_API_URL=http://localhost:3001
```

---

## Funcionalidades

### Portal de Aplicações
- Grid de micro-frontends com cards coloridos
- Apps **disponíveis**: coloridos, abrem em **iframe** dentro do shell (sem nova aba)
- Apps **sem acesso**: cinza com botão **"Solicitar Degustação"**
- Filtro por categoria e busca por nome/descrição
- Barra de app com reload, abrir em nova aba e indicador SSO

### Gestão de Acesso
- **Usuários**: CRUD completo com campo Empresa, Departamento, Perfil (admin/user), ativo/inativo
- **Permissões**: Matriz visual usuário × app com toggle individual, "Todos" e "Nenhum"
- **Solicitações**: Fluxo de aprovação/rejeição — ao aprovar, cria permissão + registro de degustação com expiração

### Degustação por Tempo
- Cada app tem `trial_days` configurável (Admin → Aplicações)
- Ao aprovar uma solicitação, grava `granted_at` e `expires_at` no banco
- Job automático revoga acessos expirados a cada 1 hora
- Portal mostra badges de status do trial

### SSO via JWT
- **Toggle global**: Admin → Configurações → SSO via JWT (ativa/desativa para toda a plataforma)
- **Toggle por app**: Admin → Aplicações → coluna SSO
- Quando ativo, ao abrir um app no iframe: gera JWT com dados do usuário e passa como `?sso_token=xxx`
- Endpoint de verificação: `GET /api/sso/verify?token=xxx`

### Configurações
- Nome e subtítulo da plataforma
- SSO global on/off
- Prazo padrão de degustação

### Categorias e Empresas
- Admin pode criar/editar/remover categorias de apps
- Usuários têm campo "Empresa" com lista gerenciável

---

## SSO — Integração com Apps

Para que um app embarcado receba e use o token SSO:

### 1. Ative o SSO no app (Admin → Aplicações → coluna SSO)

### 2. No servidor do app alvo, permita embedding:

**nginx:**
```nginx
add_header Content-Security-Policy "frame-ancestors 'self' https://seu-hub.domain.com";
```

**Express/Node:**
```js
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://seu-hub.domain.com")
  next()
})
```

### 3. No app alvo, leia e valide o token:

```js
// Lê token da URL
const params = new URLSearchParams(window.location.search)
const ssoToken = params.get('sso_token')

if (ssoToken) {
  // Valida no CyberOps HUB
  const res = await fetch(`https://seu-hub.domain.com/api/sso/verify?token=${ssoToken}`)
  const { valid, user } = await res.json()
  if (valid) {
    // user = { sub, email, name, role, department, company, app_id }
    loginWithUser(user)
  }
}
```

**Payload do token JWT:**
```json
{
  "sub": "user-id",
  "email": "alice@empresa.com",
  "name": "Alice Silva",
  "role": "user",
  "department": "TI",
  "company": "VALID",
  "avatar": "AS",
  "app_id": "app-1",
  "iat": 1700000000,
  "exp": 1700003600,
  "iss": "cyberops-hub"
}
```

---

## Banco de Dados

**Localização:** Volume Docker `cyberops-db` → `/data/cyberops.db`

**Tabelas:**

| Tabela | Descrição |
|---|---|
| `users` | Usuários com bcrypt hash de senha |
| `apps` | Micro-frontends cadastrados |
| `permissions` | Relação usuário × app |
| `requests` | Solicitações de degustação |
| `trial_access` | Registro de acesso com expiração |
| `categories` | Categorias de apps (editável) |
| `companies` | Empresas dos usuários (editável) |
| `settings` | Configurações globais da plataforma |

---

## API Reference

### Autenticação
```
POST /api/auth/login          { email, password } → { token, user }
POST /api/auth/logout
```

### Apps
```
GET    /api/apps              Lista apps com hasAccess e trial info
POST   /api/apps              Cria app (admin)
PUT    /api/apps/:id          Atualiza app (admin)
DELETE /api/apps/:id          Remove app (admin)
PATCH  /api/apps/:id/toggle      Ativa/inativa app (admin)
PATCH  /api/apps/:id/toggle-sso  Ativa/inativa SSO do app (admin)
```

### Usuários
```
GET    /api/users             Lista usuários (admin)
POST   /api/users             Cria usuário (admin)
PUT    /api/users/:id         Atualiza usuário (admin)
DELETE /api/users/:id         Remove usuário (admin)
PATCH  /api/users/:id/toggle  Ativa/inativa usuário (admin)
```

### Permissões
```
GET  /api/permissions               Mapa app → [user_ids] (admin)
POST /api/permissions/grant         { appId, userId } (admin)
POST /api/permissions/revoke        { appId, userId } (admin)
```

### Solicitações
```
GET   /api/requests              Lista (admin: todas; user: próprias)
POST  /api/requests              Envia solicitação
PATCH /api/requests/:id/approve  Aprova + cria permissão + trial (admin)
PATCH /api/requests/:id/reject   Rejeita (admin)
```

### SSO
```
POST /api/sso/token             Gera JWT SSO para um app { appId }
GET  /api/sso/verify?token=xxx  Valida token (público)
```

### Configurações
```
GET /api/settings               Retorna { key: value }
PUT /api/settings               Salva { key: value, ... } (admin)
PATCH /api/settings/:key/toggle Inverte booleano (admin)
```

### Categorias / Empresas
```
GET    /api/categories
POST   /api/categories          { name }
PUT    /api/categories/:id      { name }
DELETE /api/categories/:id

GET    /api/companies
POST   /api/companies           { name }
PUT    /api/companies/:id       { name }
DELETE /api/companies/:id
```

---

## Persistência e Backup

### Dados sobrevivem a reinicializações?

Sim. O volume Docker `cyberops-db` persiste independentemente dos containers.

```bash
# Reiniciar sem perder dados
docker compose restart

# Parar completamente (dados preservados no volume)
docker compose down

# Subir novamente (dados recuperados do volume)
docker compose up -d
```

### Backup manual

```bash
# Cria backup do banco
docker run --rm \
  -v cyberops-db:/data \
  -v $(pwd):/backup \
  alpine cp /data/cyberops.db /backup/cyberops_backup_$(date +%Y%m%d).db
```

### Restaurar backup

```bash
docker run --rm \
  -v cyberops-db:/data \
  -v $(pwd):/backup \
  alpine cp /backup/cyberops_backup_YYYYMMDD.db /data/cyberops.db

docker compose restart api
```

### Apagar tudo e recomeçar (⚠️ destrói dados)

```bash
docker compose down -v   # -v remove volumes
docker compose up -d     # seed inicial é executado automaticamente
```

---

## Repositório

**GitHub:** https://github.com/pr0t0n/mfe-platform

---

*Desenvolvido com Claude Code — Anthropic*
