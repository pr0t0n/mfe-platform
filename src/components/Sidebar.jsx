import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Users, Shield, AppWindow, LogOut,
  Bell, ChevronRight, Settings, Inbox,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useRequestStore } from '../store/useRequestStore'

const NAV_USER = [
  { to: '/portal', icon: LayoutGrid, label: 'Portal de Apps' },
]

const NAV_ADMIN = [
  { to: '/admin/apps', icon: AppWindow, label: 'Aplicações' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/admin/permissions', icon: Shield, label: 'Permissões' },
  { to: '/admin/requests', icon: Inbox, label: 'Solicitações', badge: true },
]

function NavItem({ to, icon: Icon, label, badge, pendingCount }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-brand-600 text-white shadow-md shadow-brand-900/30'
            : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
        }`
      }
    >
      <Icon size={18} strokeWidth={2} />
      <span className="flex-1">{label}</span>
      {badge && pendingCount > 0 && (
        <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
          {pendingCount}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { currentUser, logout } = useAuthStore()
  const pendingCount = useRequestStore((s) => s.getPendingCount())
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <AppWindow size={16} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">MFE Hub</p>
            <p className="text-slate-500 text-xs mt-0.5">Plataforma Corporativa</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800 mx-4 my-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Menu
        </p>
        {NAV_USER.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {currentUser?.role === 'admin' && (
          <>
            <p className="px-3 pt-4 pb-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Administração
            </p>
            {NAV_ADMIN.map((item) => (
              <NavItem key={item.to} {...item} pendingCount={pendingCount} />
            ))}
          </>
        )}
      </nav>

      <div className="h-px bg-slate-800 mx-4" />

      {/* User footer */}
      <div className="p-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors group ${
              isActive ? 'bg-brand-600' : 'hover:bg-sidebar-hover'
            }`
          }
        >
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {currentUser?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate leading-tight">
              {currentUser?.name}
            </p>
            <p className="text-slate-500 text-xs truncate">{currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
          </div>
          <Settings size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
