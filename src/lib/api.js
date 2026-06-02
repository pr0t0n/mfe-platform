const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken () {
  return localStorage.getItem('cyberops-token')
}

async function request (path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  // Auth
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  // Apps
  getApps: () => request('/api/apps'),
  createApp: (data) => request('/api/apps', { method: 'POST', body: JSON.stringify(data) }),
  updateApp: (id, data) => request(`/api/apps/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApp: (id) => request(`/api/apps/${id}`, { method: 'DELETE' }),
  toggleApp: (id) => request(`/api/apps/${id}/toggle`, { method: 'PATCH' }),
  toggleAppSso: (id) => request(`/api/apps/${id}/toggle-sso`, { method: 'PATCH' }),

  // Users
  getUsers: () => request('/api/users'),
  createUser: (data) => request('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  toggleUser: (id) => request(`/api/users/${id}/toggle`, { method: 'PATCH' }),

  // Permissions
  getPermissions: () => request('/api/permissions'),
  grantAccess: (appId, userId) => request('/api/permissions/grant', { method: 'POST', body: JSON.stringify({ appId, userId }) }),
  revokeAccess: (appId, userId) => request('/api/permissions/revoke', { method: 'POST', body: JSON.stringify({ appId, userId }) }),

  // SSO
  getSsoToken: (appId) => request('/api/sso/token', { method: 'POST', body: JSON.stringify({ appId }) }),

  // Companies
  getCompanies: () => request('/api/companies'),
  createCompany: (name) => request('/api/companies', { method: 'POST', body: JSON.stringify({ name }) }),
  updateCompany: (id, name) => request(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCompany: (id) => request(`/api/companies/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/api/categories'),
  createCategory: (name) => request('/api/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  updateCategory: (id, name) => request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),

  // Requests
  getRequests: () => request('/api/requests'),
  submitRequest: (data) => request('/api/requests', { method: 'POST', body: JSON.stringify(data) }),
  approveRequest: (id) => request(`/api/requests/${id}/approve`, { method: 'PATCH' }),
  rejectRequest: (id) => request(`/api/requests/${id}/reject`, { method: 'PATCH' }),
}
