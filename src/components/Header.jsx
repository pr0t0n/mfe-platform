import { Bell, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Header({ title, subtitle, eyebrow, actions }) {
  const { currentUser } = useAuthStore()
  const { data: requests } = useApi(() => api.getRequests(), [currentUser?.role])
  const pendingCount = currentUser?.role === 'admin' ? (requests || []).filter(r => r.status === 'pending').length : 0
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-30 flex items-end justify-between gap-8 px-10 py-6"
      style={{
        background: 'rgba(252,251,248,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5dcd5',
      }}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="eyebrow mb-2.5 text-[10.5px]">{eyebrow}</div>
        )}
        <h1
          className="text-[28px] font-semibold leading-tight m-0"
          style={{ letterSpacing: '-0.022em', color: '#1c1c1c' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-[13px] mt-2 leading-none" style={{ color: '#6b6b6b' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {actions}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/requests')}
            className="relative w-9 h-9 flex items-center justify-center rounded transition-all"
            style={{ background: 'transparent', border: '1px solid #e5dcd5', color: '#3d3d3d' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d8cdc4' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e5dcd5' }}
          >
            <Bell size={15} strokeWidth={1.7} />
            {pendingCount > 0 && (
              <span
                className="absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center text-[9px] font-bold rounded-full text-white"
                style={{ background: '#e96363' }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded transition-all"
          style={{ background: 'transparent', border: '1px solid transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0ebe7'; e.currentTarget.style.borderColor = '#e5dcd5' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: '#e96363' }}
          >
            {currentUser?.avatar}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: '#1c1c1c' }}>
            {currentUser?.name}
          </span>
        </button>
      </div>
    </header>
  )
}
