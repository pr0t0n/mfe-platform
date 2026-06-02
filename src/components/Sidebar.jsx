import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Users, Shield, AppWindow, LogOut,
  Inbox, Settings, Tag, SlidersHorizontal, Building2,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'

const NAV_USER = [
  { to: '/portal', icon: LayoutGrid, label: 'Portal de Apps', group: null },
]

const NAV_ADMIN = [
  { to: '/admin/apps', icon: AppWindow, label: 'Aplicações' },
  { to: '/admin/categories', icon: Tag, label: 'Categorias' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/admin/permissions', icon: Shield, label: 'Permissões' },
  { to: '/admin/company-permissions', icon: Building2, label: 'Acesso Empresa' },
  { to: '/admin/requests', icon: Inbox, label: 'Solicitações', badge: true },
  { to: '/admin/settings', icon: SlidersHorizontal, label: 'Configurações' },
]

const SB = {
  bg: '#16191f',
  border: '#20262f',
  group: '#565d6c',
  item: '#a8b1c0',
  itemHover: 'rgba(255,255,255,0.04)',
  active: '#e96363',
  activeShadow: '0 4px 12px rgba(233,99,99,0.25)',
  footBorder: '#20262f',
  muted: '#6b7384',
}

function NavItem({ to, icon: Icon, label, badge, pendingCount }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[13px] font-medium transition-all duration-150 mb-0.5 group"
      style={({ isActive }) => ({
        background: isActive ? SB.active : 'transparent',
        color: isActive ? '#fff' : SB.item,
        boxShadow: isActive ? SB.activeShadow : 'none',
      })}
    >
      {({ isActive }) => (
        <>
          <span
            className="w-4 h-4 inline-flex items-center justify-center flex-shrink-0"
            style={{ color: isActive ? '#fff' : SB.muted }}
          >
            <Icon size={15} strokeWidth={1.7} />
          </span>
          <span className="flex-1 leading-none">{label}</span>
          {badge && pendingCount > 0 && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[18px] text-center"
              style={{ background: '#e96363', color: '#fff' }}
            >
              {pendingCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { currentUser, logout } = useAuthStore()
  const { data: requests } = useApi(() => api.getRequests(), [currentUser?.role])
  const pendingCount = currentUser?.role === 'admin' ? (requests || []).filter(r => r.status === 'pending').length : 0
  const navigate = useNavigate()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-40"
      style={{ background: SB.bg, borderRight: `1px solid ${SB.border}` }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-[22px] mx-4"
        style={{ borderBottom: `1px solid ${SB.border}` }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: '#e96363', boxShadow: '0 0 0 3px rgba(233,99,99,0.18)' }}
        />
        <div>
          <p className="font-bold text-[15.5px] text-white leading-none" style={{ letterSpacing: '-0.01em' }}>
            CyberOps<span style={{ color: '#e96363' }}>HUB</span>
          </p>
          <p
            className="mt-1 font-mono text-[9.5px] tracking-[0.14em] uppercase leading-none font-medium"
            style={{ color: SB.muted }}
          >
            Cyber Security VALID
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3.5 overflow-y-auto space-y-0.5">
        <p
          className="px-3 pt-2 pb-1.5 font-mono text-[10px] tracking-[0.16em] uppercase font-medium"
          style={{ color: SB.group }}
        >
          Menu
        </p>
        {NAV_USER.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {currentUser?.role === 'admin' && (
          <>
            <p
              className="px-3 pt-5 pb-1.5 font-mono text-[10px] tracking-[0.16em] uppercase font-medium"
              style={{ color: SB.group }}
            >
              Administração
            </p>
            {NAV_ADMIN.map((item) => (
              <NavItem key={item.to} {...item} pendingCount={pendingCount} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div
        className="px-3 pt-4 pb-3 mt-auto"
        style={{ borderTop: `1px solid ${SB.footBorder}` }}
      >
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[7px] mb-1 transition-all duration-150"
          style={({ isActive }) => ({
            background: isActive ? '#e96363' : 'transparent',
            color: isActive ? '#fff' : SB.item,
          })}
        >
          {({ isActive }) => (
            <>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(233,99,99,0.18)', color: isActive ? '#fff' : '#e96363' }}
              >
                {currentUser?.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-white truncate leading-tight">{currentUser?.name}</p>
                <p className="font-mono text-[10.5px] truncate mt-0.5" style={{ color: SB.muted }}>
                  {currentUser?.role === 'admin' ? 'Admin · acesso total' : 'Usuário'}
                </p>
              </div>
              <Settings size={13} strokeWidth={1.7} style={{ color: SB.muted, flexShrink: 0 }} />
            </>
          )}
        </NavLink>

        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[12.5px] font-medium transition-all duration-150"
          style={{ color: SB.muted }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SB.muted }}
        >
          <LogOut size={14} strokeWidth={1.7} />
          Sair
        </button>
      </div>
    </aside>
  )
}
